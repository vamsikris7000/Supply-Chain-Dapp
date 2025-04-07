const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
      unique: true,
    },
    manufacturerName: {
      type: String,
      required: true,
    },
    manufacturerDetails: {
      type: String,
      required: true,
    },
    manufacturerLocation: {
      longitude: {
        type: String,
        required: true,
      },
      latitude: {
        type: String,
        required: true,
      },
    },
    productName: {
      type: String,
      required: true,
    },
    productCode: {
      type: Number,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    currentOwner: {
      type: String,
      required: true,
    },
    productStatus: {
      type: String,
      required: true,
      enum: [
        'Manufactured',
        'Bought By Third Party',
        'Shipped From Manufacturer',
        'Received By Third Party',
        'Bought By Customer',
        'Shipped By Third Party',
        'Received at DeliveryHub',
        'Shipped From DeliveryHub',
        'Received By Customer',
      ],
      default: 'Manufactured',
    },
    transactionHistory: [
      {
        action: String,
        timestamp: Date,
        transactionHash: String,
        fromAddress: String,
        toAddress: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 