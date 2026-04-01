const { exec } = require("child_process");

exec("npm start", (err, stdout, stderr) => {
  if (err) {
    console.error("Erro ao iniciar:", err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
