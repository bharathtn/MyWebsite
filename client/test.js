/*
 * server/controllers/api/invoice.js
 */

'use strict';
var app = require('../../app');
var request = require('request');
var _ = require('lodash');

function reverseOrderInvoice(distributorId, invoiceNumber, invoiceServerURL, cb) {
  var query = {
    distributorId: distributorId,
    invoiceNumber: invoiceNumber
  };
  var invoiceIds = [];
  app.models.Invoice
    .find(query)
    .exec(function(err, invoices) {
      invoices.forEach(function(invoice) {
        invoiceIds.push(invoice._id);
      });
      var formData = {
        invoiceIds: invoiceIds
      };
      request({
          method: 'POST',
          url: invoiceServerURL + '/api/processInvoices',
          json: formData
        },
        function(error, body, response) {
          // console.log('------1',JSON.stringify(response));
          //console.log('------2',JSON.stringify(body));
          //response=JSON.parse(response);
          cb(response);
        }
      );
    });
}

/**
 * @api {post} /api/removeInvoice Remove invoice
 * @apiName removeInvoice
 * @apiDescription This is the api to Remove invoice on Medibox.
 * @apiGroup Orders
 *
 * @apiHeader {String} mdx-token API token to authorize.
 * @apiHeader {String} mdx-username Username to authorize.
 *
 * @apiParam {String} orderId Id of the Order.
 * @apiParam {Number} invoiceNumber Number of the Invoice.
 * @apiParam {String} distributorId Id of the Distributor.
 *
 * @apiVersion 1.0.0
 * @apiParamExample {json} Sample:
 *  {
	"orderId": "56d52a943a0d0f1f4100005f",
	"invoiceNumber": "1234",
	"distributorId": "56829f7d2d6fbda706000042"
    }
 *
 * @apiExample {curl} Example usage:
 * curl -i https://www.medibox.in/api/removeInvoice
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "User not authorized"
 *     }
 *
 *
 */

function removeInvoice(req, cb) {
  // console.log(JSON.stringify(req.body));
  var query;
  if (req.body.id) {
    query = {
      _id: req.body.id
    };
  } else {
    query = {
      invoiceNumber: req.body.invoiceNumber,
      distributorId: req.body.distributorId,
      orderId: new Object(req.body.orderId)
    };
  }
  app.models.Invoice.remove(query, function(err, result) {
    if (err) {
      cb(null, false);
    } else {
      console.log('result', result);
      cb(null, true);
    }
  });
}

function getInvoiceDetailsByOrderReferenceId(req, cb) {
  var selection = {
    createdDate: 1,
    invoiceNumber: 1,
    invoiceAmount: 1,
    status: 1,
    items: 1
  };
  if (req.body.selection) {
    selection = req.body.selection;
  }
  app.models.Invoice.findOne({
    orderReferenceId: req.body.orderReferenceId
  }, selection, function(err, result) {
    if (result) {
      var data = {
        id: result._id,
        createdDate: result.createdDate,
        invoiceNumber: result.invoiceNumber,
        invoiceAmount: result.invoiceAmount,
        itemCount: result.items.length
      };
      cb(null, data);
    } else {
      cb(null, {
        status: 'Data not found'
      });
    }
  });
}


function createInvoiceFromIntegration(req, cb) {

  console.log('req.bodtttttttttttttt' + JSON.stringify(req.body));
  var result = {
    status: false,
    response: {}
  };
  var invoiceNumber = '';
  var invoiceDate = '';
  var invoiceAmount = '';
  var taxAmount = '';
  var discountAmount = '';
  var invoiceItemsArray = {
    'listing': {
      'abatedPrice': ''
    },
    'batchNumber': '',
    'expiryDate': '',
    'discountAmount': '',
    'rate': '',
    'vatPer': '',
    'cdPer': '',


  };

  var invoiceData = {
    'distributorId': req.body.orderData.businessInfo.to.businessId,
    'supplierCode': '',
    'customerCode': req.body.orderData.businessInfo.from.referenceId,
    'customerName': req.body.orderData.businessInfo.from.name,
    'orderId': req.body.orderData.orderId,
    'orderReferenceId': '',
    'invoiceNumber': '',
    'invoiceDate': '',
    'invoiceAmount': '',
    'taxAmount': '',
    'discountAmount': '',
    'items': [],
    'createdBy': '',
    'createdDate': '',
    'updatedBy': '',
    'updatedDate': '',
    'salesManCode': '',
    'deliveryManCode': '',
    'creditDays': '',

  };
  if (req.body.orderData && req.body.orderData.invoiceDetails.length > 0) {
    _.forEach(req.body.orderData.invoiceDetails, function(key) {
      invoiceData.invoiceNumber = key.invoiceNo;
      invoiceData.invoiceDate = key.invoiceDate;
      invoiceData.invoiceAmount = key.invoiceAmount;
      invoiceData.taxAmount = key.tax;
      invoiceData.discountAmount = key.discount;

    });
  }
  if (req.body.orderData && req.body.orderData.invoiceItemsArray.length > 0) {
    _.forEach(req.body.orderData.invoiceItemsArray, function(key) {
      invoiceItemsArray.listing.tax = key.taxPercentage;
      invoiceItemsArray.listing.discountPercentage = key.discount;
    })
  }
  if (req.body.orderData && req.body.orderData.items.length > 0) {
    console.log('inside ssssssssssss\n ' + req.body.orderData.items.length);
    var arr = [];
    // var abc = {
    //   // 'listing': {
    //   //   'abatedPrice': ''
    //   // },
    //   // 'batchNumber': '',
    //   // 'expiryDate': '',
    //   // 'discountAmount': '',
    //   // 'rate': '',
    //   // 'vatPer': '',
    //   // 'cdPer': '',
    // };

    for (var i = 0; i < req.body.orderData.items.length; i++) {
      var abc ={};
      var key = req.body.orderData.items[i];
      console.log('\nkeysdadssadsadasdsadsadsadsadsadsa' + JSON.stringify(key) + '\n');
      console.log(' key.sku' + JSON.stringify(key.sku));
      abc.productName = key.name;
      // abc.manufacturerName = key.marketingCompany.name;
      // abc.packSize = key.packSize;
      // abc.listing.price = key.MRP;
      // abc.listing.sellingPrice = key.unitPrice;
      // abc.quantity = key.quantity.orderQty;
      // abc.schemeQuantity = key.scheme;
      // abc.mrp = key.MRP;
      // abc.invoiceSource = key.invoiceSource;
      // abc.cGstPer = key.cGstPer;
      // abc.sGstPer = key.sGstPer;
      // abc.iGstPer = key.iGstPer;
      // abc.gCessPer = key.gCessPer;
      // abc.cGstAmt = key.cGstAmt;
      // abc.sGstAmt = key.sGstAmt;
      // abc.iGstAmt = key.iGstAmt;
      // abc.gCessAmt = key.gCessAmt;
      console.log('\n abc' + [i] + JSON.stringify(abc) + '\n')
       arr.push(abc)

    }

    arr.push("abc");
    arr.push("def");

    console.log('\nArray '+JSON.stringify(arr) + '\n');


  }

  console.log('main data' + JSON.stringify(invoiceData));
  app.models.Invoice.create(invoiceData, function(err, res) {
    if (res) {
      cb(null, result);
    } else {
      result.response = 'Cannot insert New Invoice';
      cb(null, result);
    }
  });

  // var result = {
  //     status : false,
  //     response : {}
  // };
  // var invoiceData = {
  //
  // };
  //
  // app.models.Invoice.create(invoiceData,function (err,res) {
  //     if(res){
  //         cb(null,result);
  //     }else{
  //         result.response = 'Cannot insert New Invoice';
  //         cb(null,result);
  //     }
  // });
}


exports.reverseOrderInvoice = reverseOrderInvoice;
exports.removeInvoice = {
  POST: removeInvoice
};
exports.getInvoiceDetailsByOrderReferenceId = {
  POST: getInvoiceDetailsByOrderReferenceId
};
exports.createInvoiceFromIntegration = {
  POST: createInvoiceFromIntegration
};
