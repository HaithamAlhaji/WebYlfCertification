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
router.get("/verifyCertification", (req, res) => {
  const defaultStyle = req.app.get("defaultStyle");
  res.render("home/verifyCertification", {
    item: "verify" /* For navbar active */,
    defaultStyle: defaultStyle
  });
});
router.post("/verifyCertification", (req, res) => {
  const defaultStyle = req.app.get("defaultStyle");
  var verify = "false";
  var creation = "NaN";
  var name = "NONE";
  mysqlConnection.getConnection((err, connection) => {
    const sql = `select DATE_FORMAT(date(creation), '%Y-%m-%d')  as creation,name from tbl_ylf_memebers where serial_number = '${req.body.serial_number}';`;
    connection.query(sql, (errors, results, fields) => {
      if (results.length > 0) {
        verify = "true";
        creation = results[0].creation;
        name = results[0].name;
      }
      res.render("home/verifyCertification", {
        item: "verify" /* For navbar active */,
        defaultStyle: defaultStyle,
        verify: verify,
        creation: creation,
        name: name
      });
    });

    connection.release();
  });
});
router.post("/certifications", (req, res) => {
  if (req.body.member_email) {
    const defaultStyle = req.app.get("defaultStyle");

    mysqlConnection.getConnection((err, connection) => {
      const sqlClientInfo = `SELECT id,email, name_ar, name_en, (SELECT COUNT(*) FROM tbl_certifications WHERE client_id = clients.id) AS \`certifications_count\` FROM tbl_clients clients WHERE clients.email = '${req.body.member_email}'`;
      var clientInfo;
      connection.query(sqlClientInfo, (errors, results, fields) => {
        if (results.length == 0) {
          res.redirect("/");
          return;
        }
        clientInfo = {
          id: results[0].id,
          email: req.body.member_email,
          nameEn: results[0].name_en,
          nameAr: results[0].name_ar,
          certificationsCount: results[0].certifications_count
        };
        req.session.clientInfo = clientInfo;
        mysqlConnection.getConnection((err, connection) => {
          const sqlClientCertifications = `SELECT certifications.id,certifications_templates.name, CONCAT(certifications_templates.code,certifications.id) AS \`serial_number\`, certifications_templates.description, certifications_templates.provider,certifications_templates.background, certifications_templates.image_en, certifications_templates.image_ar, certifications_templates.code_x, certifications_templates.code_y, certifications_templates.name_en_x, certifications_templates.name_en_y, certifications_templates.creation_x, certifications_templates.creation_y, DATE_FORMAT(certifications_templates.creation,'%Y-%m-%d') AS \`creation\`, users.email AS \`user_email\`,certifications_templates.name_en_width FROM tbl_certifications certifications LEFT JOIN tbl_certifications_templates certifications_templates ON certifications_templates.id = certifications.certification_template_id LEFT JOIN tbl_users users ON users.id = certifications.user_id WHERE certifications.client_id = ${clientInfo.id};`;
          var clientCertifications = [];
          connection.query(
            sqlClientCertifications,
            (errors, results, fields) => {
              for (let index = 0; index < results.length; index++) {
                const certification = results[index];
                clientCertifications.push(certification);
              }
              req.session.clientCertifications = clientCertifications;
              res.render("home/certifications", {
                clientInfo: clientInfo,
                clientCertifications: clientCertifications,
                item: "download" /* For navbar active */,
                defaultStyle: defaultStyle
              });
            }
          );
        });

        connection.release();
      });
    });
  } else {
    res.redirect("/");
  }
});
router.post("/:id/download.pdf", (req, res) => {
  const id = req.params.id;
  const certifications = req.session.clientCertifications;
  var certification;
  for (let index = 0; index < certifications.length; index++) {
    const element = certifications[index];

    if (element.id == id) {
      certification = element;
      break;
    }
  }
  var fs = require("fs");
  var PDFDocument = require("pdfkit");
  const uniqueName = require("unique-filename");
  var pdf = new PDFDocument({
    size: "A4", // See other page sizes here: https://github.com/devongovett/pdfkit/blob/d95b826475dd325fb29ef007a9c1bf7a527e9808/lib/page.coffee#L69
    layout: "landscape",
    margin: 0,
    info: {
      Title: "Youthlf",
      Author: "Hatiham Alhaji",
      Producer: "Hatiham Alhaji",
      Creator: "Hatiham Alhaji"
    }
  });
  //const filePath = uniqueName("./public/tmp/") + ".pdf";
  pdf
    .font("./public/fonts/FONT BOLD.otf")
    .fontSize("23")
    .image(
      "./public/img/certifications/templates/" + certification.image_en,
      0,
      0,
      {
        scale: 0.24
      }
    )
    .text(
      req.session.clientInfo.nameEn,
      certification.name_en_x,
      certification.name_en_y,
      {
        align: "center",
        width: certification.name_en_width
      }
    )
    .fontSize("11")
    .text(
      certification.creation,
      certification.creation_x,
      certification.creation_y,
      {
        align: "center",
        width: 450
      }
    )
    .fontSize("14")
    .text(
      certification.serial_number,
      certification.code_x,
      certification.code_y
    )

    .pipe(res);

  pdf.end();
});

module.exports = router;
