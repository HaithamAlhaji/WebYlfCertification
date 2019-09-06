const downloadCertification = id => {
  $("#certification" + id + " .downloads_count").html(
    Number($("#certification" + id + " .downloads_count").html()) + 1
  );
};
