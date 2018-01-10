import app from "./src/app";

const port = process.env.PORT || 9001;

app.listen(port, (err) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${port}`);
});

