const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("View one stock", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        assert.equal(res.body.stockData.stock, "GOOG");
        done();
      });
  });

  test("One stock with like", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&like=true")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, "stock");
        assert.property(res.body.stockData, "price");
        assert.property(res.body.stockData, "likes");
        assert.equal(res.body.stockData.stock, "GOOG");
        assert.isAbove(res.body.stockData.likes, 0);
        done();
      });
  });

  test("Same stock with another like", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&like=true")
      .then(function (previous) {
        chai
          .request(server)
          .get("/api/stock-prices?stock=GOOG&like=true")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, "stockData");
            assert.isObject(res.body.stockData);
            assert.property(res.body.stockData, "stock");
            assert.property(res.body.stockData, "price");
            assert.property(res.body.stockData, "likes");
            assert.equal(res.body.stockData.stock, "GOOG");
            assert.isAbove(res.body.stockData.likes, 0);
            assert.equal(
              res.body.stockData.likes,
              previous.body.stockData.likes
            );
            done();
          });
      });
  });

  test("Two stocks", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&stock=MSFT")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.property(res.body.stockData[0], "stock");
        assert.property(res.body.stockData[0], "price");
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "stock");
        assert.property(res.body.stockData[1], "price");
        assert.property(res.body.stockData[1], "rel_likes");
        done();
      });
  });

  test("Two stocks with like", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&stock=MSFT&like=true")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "stockData");
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.property(res.body.stockData[0], "stock");
        assert.property(res.body.stockData[0], "price");
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "stock");
        assert.property(res.body.stockData[1], "price");
        assert.property(res.body.stockData[1], "rel_likes");
        done();
      });
  });
});
