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
      DOMAIN_NAME: process.env.DOMAIN_NAME,
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

const uploadStaticFiles = async (satelliteName, dirPath) => {
  const podName = await getWebServerPodName(satelliteName).then((str) =>
    str.trim().slice(4)
  );

  return new Promise((resolve, reject) => {
    const arguments = [
      "-c",
      `cd ${dirPath} && tar cvf - * | kubectl exec -i -n ${satelliteName} ${podName} -- tar xf - -C /media/data`,
    ];

    const child = spawn("sh", arguments);

    child.stdout.on("data", (data) => {
      console.log(`data: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.log(`data: ${data}`);
      // reject(data.toString());
    });

    child.on("exit", (code, signal) => {
      console.log(`process exited with code ${code} and signal ${signal}`);

      if (code !== 0) {
        reject("Something went wrong");
      }

      resolve();
    });

    child.on("error", (error) => {
      console.error(`error: ${error.message}`);
      reject(error.message);
    });
  });
};

const getWebServerPodName = (satelliteName) => {
  return new Promise((resolve, reject) => {
    const arguments = [
      "get",
      "pod",
      `-n=${satelliteName}`,
      "-l",
      "type=satellite-web-server",
      "-o",
      "name",
    ];

    const child = spawn("kubectl", arguments);

    let podName;

    child.stdout.on("data", (data) => {
      console.log(`data: ${data}`);
      podName = data.toString();
    });

    child.stderr.on("data", (data) => {
      console.log(`data: ${data}`);
      reject(data.toString());
    });

    child.on("exit", (code, signal) => {
      console.log(`process exited with code ${code} and signal ${signal}`);

      if (code !== 0) {
        reject("Something went wrong");
      }

      resolve(podName);
    });

    child.on("error", (error) => {
      console.error(`error: ${error.message}`);
      reject(error.message);
    });
  });
};

module.exports = {
  spinUpSatellite,
  tearDownSatellite,
  getWebServerPodName,
  uploadStaticFiles,
};
