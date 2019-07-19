const express = require("express"),
  router = express.Router();

router.all("*", (req, res, next) => {
  res.app.locals.layout = "home/index";
  next();
});
router.get("/", (req, res) => {
  const defaultStyle = req.app.get("defaultStyle");
  res.render("home/index", {
    item: "download" /* For navbar active */,
    defaultStyle: defaultStyle
  });
});

router.post("/download", (req, res) => {
  if (req.body.member_email) {
    mysqlConnection.getConnection((err, connection) => {
      const sql = `select email,version,name,serial_number from tbl_ylf_memebers WHERE email = ${mysqlConnection.escape(
        req.body.member_email
      )};`;

      connection.query(sql, (errors, results, fields) => {
        console.log(errors);

        if (errors) {
          throw errors;
        } else {
          if (results.length > 0) {
            // ملتقى بابل كل الاسماء ممكن تاخذ شهادة true
            var fs = require("fs");
            var PDFDocument = require("pdfkit");
            const uniqueName = require("unique-filename");
            var pdf = new PDFDocument({
              size: "A4", // See other page sizes here: https://github.com/devongovett/pdfkit/blob/d95b826475dd325fb29ef007a9c1bf7a527e9808/lib/page.coffee#L69
              layout: "landscape",
              margin: 0,
              info: {
                Title: "Youthlf",
                Author: "Hatiham Alhaji"
              }
            });
            const filePath = uniqueName("./public/tmp/") + ".pdf";
            if (results[0].version == 2) {
              // الملتقى الخامس
              pdf
                .font("./public/fonts/FONT BOLD.otf")
                .fontSize("23")
                .image(
                  results[0].member_type == 0
                    ? "./public/uploads/4.png"
                    : "./public/uploads/5.png",
                  0,
                  0,
                  { scale: 0.24 }
                )
                // .text(
                //   results[0].name,
                //   results[0].name.toString().split(" ").length == 1
                //     ? 300
                //     : results[0].name.toString().split(" ").length == 2
                //     ? 530
                //     : results[0].name.toString().split(" ").length == 3
                //     ? 450
                //     : results[0].name.toString().split(" ").length == 4
                //     ? 400
                //     : 400,
                //   240,
                // )
                .text(results[0].name, 360, 240, {
                  align: "center",
                  width: 450
                })
                .fontSize("16")
                .text(results[0].serial_number, 375, 528)
                .pipe(fs.createWriteStream(filePath))
                .on("finish", function() {
                  fs.readFile(filePath, function(err, data) {
                    res.contentType("application/pdf");
                    console.log(err);
                    res.send(data);
                  });
                });
              // Close PDF and write file.
              pdf.end();
            }
          } else {
            const defaultStyle = req.app.get("defaultStyle");
            //mysqlConnection.end();
            res.render("home/index", {
              item: "index" /* For navbar active */,
              defaultStyle: defaultStyle,
              certification: false
            });
          }
        }
      });
      //
      connection.release();
    });
  }
});
module.exports = router;
