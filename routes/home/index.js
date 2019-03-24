const express = require("express"),
  router = express.Router();

router.all("*", (req, res, next) => {
  res.app.locals.layout = "home/index";
  next();
});
router.get("/", (req, res) => {
  const defaultStyle = req.app.get("defaultStyle");
  res.render("home/index", {
    item: "index" /* For navbar active */,
    defaultStyle: defaultStyle
  });
});

router.get("/categories", (req, res) => {
  const defaultStyle = req.app.get("defaultStyle");
  res.render("home/categories", {
    item: "categories",
    defaultStyle: defaultStyle
  });
});

router.get("/book/:id", (req, res) => {
  var id = req.params.id;
  const defaultStyle = req.app.get("defaultStyle");
  const mysqlConnection = req.app.get("mysqlConnection");
  mysqlConnection.query(`CALL getBook(${id});`, (errors, results, fields) => {
    if (errors) {
      res.send("sql error");
    } else if (results[0].length == 0) {
      res.send("no book");
    } else {
      res.render("home/book", {
        item: "book",
        defaultStyle: defaultStyle,
        book: {
          id: results[0][0].id,
          name: results[0][0].name,
          description: results[0][0].description,
          pagesCount: results[0][0].page_count,
          category: results[0][0].categoryName,
          author: results[0][0].author,
          version: results[0][0].version,
          creation: results[0][0].creation,
          container: {
            color: results[0][0].color
          },
          floor: {
            name: results[0][0].floorName
          }
        }
      });
    }
  });
});

router.post("/download", (req, res) => {
  if (req.body.member_name) {
    const defaultStyle = req.app.get("defaultStyle");
    const mysqlConnection = req.app.get("mysqlConnection");

    const sql = `select 'haitham' as \`result\` from tbl_ylf_memebers where name = ${mysqlConnection.escape(
      req.body.member_name
    )};`;
    mysqlConnection.query(sql, (errors, results, fields) => {
      if (errors) {
        throw errors;
      } else {
        if (results.length > 0 && results[0].result == "haitham") {
          var fs = require("fs");
          var PDFDocument = require("pdfkit");
          const blobStream = require("blob-stream");
          const uniqueName = require("unique-filename");
          var pdf = new PDFDocument({
            size: "A4", // See other page sizes here: https://github.com/devongovett/pdfkit/blob/d95b826475dd325fb29ef007a9c1bf7a527e9808/lib/page.coffee#L69
            layout: "landscape",
            info: {
              Title: "Tile of File Here",
              Author: "Some Author"
            }
          });
          const filePath = uniqueName("./public/tmp/") + ".pdf";
          pdf
            .font("./public/fonts/Cairo-Regular.ttf")
            .fontSize("40")
            .image("./public/uploads/1.png", 0, 0, { scale: 0.25 })
            .text(
              req.body.member_name
                .toString()
                .split(" ")
                .reverse()
                .join(" "),
              {
                align: "right"
              },
              200,
              100
            )
            .pipe(fs.createWriteStream(filePath))
            .on("finish", function() {
              console.log("PDF closed");
              console.log(filePath);
              fs.readFile(filePath, function(err, data) {
                res.contentType("application/pdf");
                console.log(err);
                res.send(data);
              });
            });

          // Close PDF and write file.
          pdf.end();
        } else {
          const defaultStyle = req.app.get("defaultStyle");
          res.render("home/index", {
            item: "index" /* For navbar active */,
            defaultStyle: defaultStyle,
            certification: false
          });
        }
      }
    });
  }
});
module.exports = router;
