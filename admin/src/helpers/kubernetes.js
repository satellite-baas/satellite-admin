const { spawn } = require("child_process");

const CREATE_ARGUMENTS = [
  "-c",
  "envsubst < /app/src/satellite-manifest/satellite-manifest.yaml | kubectl apply -f -",
];

const DELETE_ARGUMENTS = ["delete", "namespace"];

const spinUpSatellite = (name, apiKey, onSuccess, onFailure) => {
  const bufferArray = [];
  const child = spawn("sh", CREATE_ARGUMENTS, {
    env: {
      ...process.env,
      SATELLITE_NAME: name,
      API_KEY: apiKey,
    },
  });

  child.stdout.on("data", (data) => {
    console.log(`data: ${data}`);
    bufferArray.push(data);
  });

  child.stderr.on("data", (data) => {
    console.log(`data: ${data}`);
    bufferArray.push(data);
  });

  child.on("exit", (code, signal) => {
    console.log(`process exited with code ${code} and signal ${signal}`);
    const output = bufferArray.map((data) => data.toString());
    if (code !== 0) {
      return onFailure(output);
    }
    return onSuccess(output);
  });

  child.on("error", (error) => {
    console.error(`error: ${error.message}`);
    return onFailure([error.message]);
  });
};

const tearDownSatellite = (name, onSuccess, onFailure) => {
  const bufferArray = [];

  const child = spawn("kubectl", [...DELETE_ARGUMENTS, name]);

  child.stdout.on("data", (data) => {
    console.log(`data: ${data}`);
    bufferArray.push(data);
  });

  child.stderr.on("data", (data) => {
    console.log(`data: ${data}`);
    bufferArray.push(data);
  });

  child.on("exit", (code, signal) => {
    console.log(`process exited with code ${code} and signal ${signal}`);
    const output = bufferArray.map((data) => data.toString());
    if (code !== 0) {
      return onFailure(output);
    }

    return onSuccess(output);
  });

  child.on("error", (error) => {
    console.error(`error: ${error.message}`);
    return onFailure([error.message]);
  });
};

const createKubectlCommand = (satelliteName, dirPath) => {
  const arguments = ["-c", "kubectl "];
};

const uploadStaticFiles = (satelliteName, dirPath) => {};

const getWebServerPodName = async (satelliteName) => {
  const arguments = [
    "get",
    "pod",
    `-n=${satelliteName}`,
    "-l",
    "type=satellite-server",
    "-o",
    "name",
  ];

  const child = spawn("kubectl", arguments);

  child.stdout.on("data", (data) => {
    console.log(`data: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.log(`data: ${data}`);
  });

  child.on("exit", (code, signal) => {
    console.log(`process exited with code ${code} and signal ${signal}`);
    // if (code !== 0) {
    //   return onFailure(output);
    // }

    // return onSuccess(output);
  });

  child.on("error", (error) => {
    console.error(`error: ${error.message}`);
    // return onFailure([error.message]);
  });
};

module.exports = {
  spinUpSatellite,
  tearDownSatellite,
  getWebServerPodName,
};
