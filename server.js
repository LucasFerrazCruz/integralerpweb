import { exec } from "child_process";

exec("npm start", (err, stdout, stderr) => {
  console.log(stdout);
  console.error(stderr);
});
