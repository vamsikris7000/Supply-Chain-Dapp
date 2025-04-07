import React from "react";
import Paper from "@material-ui/core/Paper";
import Navbar from "../components/Navbar";
import CustomizedInputBase from "../components/Search";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import ProductModal from "../components/Modal";
import ReciptModal from "../components/ReciptModal";
import TableRow from "@material-ui/core/TableRow";
import { Grid } from "@material-ui/core";
import { MapContainer } from "../components/map";
import Button from "@material-ui/core/Button";
import { useStyles } from "../components/Styles";
import Loader from "../components/Loader";
import axios from "axios";

const columns = [
  { id: "id", label: "Universal ID", minWidth: 170 },
  { id: "mname", label: "Manfacturer", minWidth: 170 },
  { id: "mdate", label: "Date", minWidth: 170 },
  { id: "pname", label: "Product Name", minWidth: 170 },
  { id: "price", label: "Price", minWidth: 170 },
  { id: "owner", label: "Owner", minWidth: 170 },
  { id: "lastAction", label: "Last Action", minWidth: 170 },
];

const map = [
  "Manufactured",
  "Bought By Third Party",
  "Shipped From Manufacturer",
  "Received By Third Party",
  "Bought By Customer",
  "Shipped By Third Party",
  "Received at DeliveHub",
  "Shipped From DeliveryHub",
  "Received By Customer",
];

export default function Explorer(props) {
  const classes = useStyles();
  const web3 = props.web3;
  const supplyChainContract = props.supplyChainContract;
  const [productData, setProductData] = React.useState([]);
  const [productHistory, setProductHistory] = React.useState([]);
  const [Text, setText] = React.useState(false);
  const navItem = [];
  const [modalData, setModalData] = React.useState([]);
  const [modalReciptData, setModalReciptData] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [openRecipt, setOpenRecipt] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const API_URL = "http://localhost:5000/api";

  const findProduct = async (search) => {
    var arr = [];
    var temp = [];
    setLoading(true);
    try {
      setProductData([]);
      setProductHistory([]);
      
      // First try to get from MongoDB
      try {
        const { data } = await axios.get(`${API_URL}/products/${parseInt(search)}`);
        if (data) {
          // Product found in MongoDB
          console.log("Product found in MongoDB:", data);
          
          // Format data to match contract data structure
          var a = [
            data.productId.toString(),
            data.productCode.toString(),
            data.currentOwner,
            data.manufacturerName,
            data.manufacturerName,
            data.manufacturerDetails,
            data.manufacturerLocation.longitude,
            data.manufacturerLocation.latitude,
          ];
          
          var b = [
            new Date(data.createdAt).toLocaleString(),
            data.productName,
            data.productPrice.toString(),
            data.productCategory,
          ];
          
          var c = [
            data.productStatus,
            "0", // Placeholder for transaction hash - will be replaced with real data
          ];
          
          temp.push(a);
          temp.push(b);
          temp.push(c);
          setProductData(temp);
          
          // Format transaction history
          if (data.transactionHistory && data.transactionHistory.length > 0) {
            arr = [];
            for (var i = 0; i < data.transactionHistory.length; i++) {
              const hist = data.transactionHistory[i];
              var histTemp = [];
              
              var h = [
                data.productId.toString(),
                data.productCode.toString(),
                hist.fromAddress,
                data.manufacturerName,
                data.manufacturerName,
                data.manufacturerDetails,
                data.manufacturerLocation.longitude,
                data.manufacturerLocation.latitude,
              ];
              
              var k = [
                new Date(hist.timestamp).toLocaleString(),
                data.productName,
                data.productPrice.toString(),
                data.productCategory,
              ];
              
              var j = [
                hist.action,
                hist.transactionHash,
              ];
              
              histTemp.push(h);
              histTemp.push(k);
              histTemp.push(j);
              arr.push(histTemp);
            }
            setProductHistory(arr);
          }
          
          setLoading(false);
          return;
        }
      } catch (mongoErr) {
        console.log("Product not found in MongoDB, checking blockchain...");
      }
      
      // If not found in MongoDB, get from blockchain
      var a = await supplyChainContract.methods
        .fetchProductPart1(parseInt(search), "product", 0)
        .call();
      var b = await supplyChainContract.methods
        .fetchProductPart2(parseInt(search), "product", 0)
        .call();
      var c = await supplyChainContract.methods
        .fetchProductPart3(parseInt(search), "product", 0)
        .call();
      temp.push(a);
      temp.push(b);
      temp.push(c);
      setProductData(temp);
      
      // Save product to MongoDB
      try {
        const productToSave = {
          productId: parseInt(a[0]),
          manufacturerName: a[3],
          manufacturerDetails: a[5],
          manufacturerLocation: {
            longitude: a[6],
            latitude: a[7],
          },
          productName: b[1],
          productCode: parseInt(a[1]),
          productPrice: parseInt(b[2]),
          productCategory: b[3],
          currentOwner: a[2],
          transactionHash: c[1],
        };
        
        await axios.post(`${API_URL}/products`, productToSave);
        console.log("Product saved to MongoDB");
      } catch (saveErr) {
        console.log("Error saving to MongoDB:", saveErr);
      }
      
      arr = [];
      var l = await supplyChainContract.methods
        .fetchProductHistoryLength(parseInt(search))
        .call();

      arr = [];
      for (var i = 0; i < l; i++) {
        var h = await supplyChainContract.methods
          .fetchProductPart1(parseInt(search), "history", i)
          .call();
        var k = await supplyChainContract.methods
          .fetchProductPart2(parseInt(search), "history", i)
          .call();
        var j = await supplyChainContract.methods
          .fetchProductPart3(parseInt(search), "history", i)
          .call();
        temp = [];
        temp.push(h);
        temp.push(k);
        temp.push(j);
        arr.push(temp);
        
        // Update MongoDB with transaction history
        try {
          const historyToSave = {
            productStatus: j[0],
            action: j[0],
            transactionHash: j[1],
            fromAddress: h[2],
            toAddress: h[2],
          };
          
          await axios.put(`${API_URL}/products/${parseInt(search)}`, historyToSave);
        } catch (histErr) {
          console.log("Error updating history in MongoDB:", histErr);
        }
      }
      setProductHistory(arr);
    } catch (e) {
      setText(true);
      console.log(e);
    }
    setLoading(false);
  };

  const handleClose = () => setOpen(false);
  const handleCloseRecipt = () => setOpenRecipt(false);

  const handleClick = async (prod) => {
    await setModalData(prod);
    setOpen(true);
  };

  const fetchTxRecipt = async (hash) => {
    web3.eth.getTransaction(hash).then((recipt) => {
      setModalReciptData(recipt);
      setOpenRecipt(true);
    });
  };

  return (
    <>
      <Navbar navItems={navItem}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <ProductModal
              prod={modalData}
              open={open}
              handleClose={handleClose}
            />
            <ReciptModal
              recipt={modalReciptData}
              openRecipt={openRecipt}
              handleCloseRecipt={handleCloseRecipt}
            />
            <h1 className={classes.pageHeading}>Search a product</h1>
            <CustomizedInputBase findProduct={findProduct} />
            {productData.length !== 0 ? (
              <>
                <Grid container className={classes.Explorerroot} spacing={3}>
                  <Grid item xs={6}>
                    <Paper className={classes.ProductPaper}>
                      <div>
                        <div className={classes.ExplorerdRow}>
                          Universal ID : {productData[0][0]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          SKU : {productData[0][1]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          Owner : {productData[0][2]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          Manufacturer : {productData[0][3]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          Name of Manufacturer : {productData[0][4]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          Details of Manufacturer : {productData[0][5]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          Longitude of Manufature : {productData[0][6]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          Latitude of Manufature : {productData[0][7]}
                        </div>
                        <div className={classes.ExplorerdRow}>
                          Manufactured date : {productData[1][0]}
                        </div>

                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          onClick={() => handleClick(productData)}
                          style={{ margin: "10px auto" }}
                        >
                          MORE DETAILS
                        </Button>
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} style={{ position: "relative" }}>
                    <MapContainer prodData={productData} />
                  </Grid>
                </Grid>
                <br />
                <h2 className={classes.tableCount}> Product History</h2>
                <Paper className={classes.TableRoot2}>
                  <TableContainer className={classes.TableContainer}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              align="center"
                              className={classes.TableHead}
                              // style={{ minWidth: column.minWidth }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                          <TableCell
                            align="center"
                            className={classes.TableHead}
                          >
                            Details
                          </TableCell>
                          <TableCell
                            align="center"
                            className={classes.TableHead}
                          >
                            Recipt
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productHistory.length !== 0 ? (
                          productHistory.map((row) => {
                            console.log(row[1][0]);
                            const d = new Date(parseInt(row[1][0] * 1000));
                            console.log(JSON.stringify(d));
                            return (
                              <TableRow
                                hover
                                role="checkbox"
                                tabIndex={-1}
                                key={row[0][0]}
                              >
                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                  onClick={() => handleClick(row)}
                                >
                                  {row[0][0]}
                                </TableCell>
                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                  onClick={() => handleClick(row)}
                                >
                                  {row[0][4]}
                                </TableCell>
                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                  onClick={() => handleClick(row)}
                                >
                                  {d.toDateString() + " " + d.toTimeString()}
                                </TableCell>
                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                  onClick={() => handleClick(row)}
                                >
                                  {row[1][1]}
                                </TableCell>
                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                  onClick={() => handleClick(row)}
                                >
                                  {row[1][3]}
                                </TableCell>
                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                  onClick={() => handleClick(row)}
                                >
                                  {/* {row[0][2]} */}
                                  {row[0][2].length > 15
                                    ? row[0][2].substring(0, 15) + "..."
                                    : row[0][2]}
                                </TableCell>

                                <TableCell
                                  style={{ color: "#f00 !important" }}
                                  className={classes.TableCell}
                                  align="center"
                                >
                                  {map[row[1][5]]}
                                </TableCell>

                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                >
                                  <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleClick(row)}
                                  >
                                    DETAILS
                                  </Button>
                                </TableCell>

                                <TableCell
                                  className={classes.TableCell}
                                  align="center"
                                >
                                  <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => fetchTxRecipt(row[2][5])}
                                  >
                                    RECIPT
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
            ) : (
              <>{Text ? <p>Product Not Found</p> : <></>}</>
            )}
          </>
        )}
      </Navbar>
    </>
  );
}
