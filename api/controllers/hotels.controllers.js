var hotelData = require('../data/hotel-data.json');

module.exports.hotelsGetAll = function(req, res) {
  console.log("get hotels");
  var offset = 0;
  var count = 5;

  if (req.query && req.query.offset) {
    offset = parseInt(req.query.offset, 10);
  }

  if (req.query && req.query.count) {
    offset = parseInt(req.query.count, 10);
  }
  var returnData = hotelData.slice(offset, offset + count);
  res.status(200)
    .json(returnData);
};

module.exports.hotelsGetOne = function(req, res) {
  console.log(req.query);
  var hotelId = req.params.hotelId;
  var thisHotel = hotelData[hotelId];
  console.log("hotels", hotelId);
  res.status(200)
    .json(thisHotel);
};
