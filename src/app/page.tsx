"use client";

import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { open } from "@tauri-apps/api/dialog";
import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";

import CroppingResizingViewSettings from "./cropping-resizing-view-settings";
import { ResponseType } from "@tauri-apps/api/http";
import SettingsModal from "./settings-modal";

const DEBUG = true;

export default function Home() {
  // Holds the fisheye coordinates and view settings
  const [viewSettings, setViewSettings] = useState({
    xres: "",
    yres: "",
    diameter: "",
    xleft: "",
    ydown: "",
    vv: "",
    vh: "",
    targetRes: "1000",
  });

  // const [imgDirs, setImgDirs] = useState<any[]>([]);
  let imgDirs: any | any[] = [];

  // Holds the file paths for the backend
  const [devicePaths, setDevicePaths] = useState<any[]>([]);

  // Holds the file paths for the frontend
  const [assetPaths, setAssetPaths] = useState<any[]>([]);

  // Holds the temporary device file paths selected by the user during the dialog function
  let selected: any | any[] = [];

  // Holds the temporary asset paths selected by the user during the dialog function
  let assets: any[] = [];

  let response: any = "";
  const [responsePaths, setResponsePaths] = useState<string>("");

  // Correction files fe = fish eye, v= vignetting, nd = neutral density, cf = calibration factor
  let fe_correction: any = "";
  const [fe_correctionPaths, set_fe_correctionPaths] = useState<string>("");

  let v_correction: any = "";
  const [v_correctionPaths, set_v_correctionPaths] = useState<string>("");

  let nd_correction: any = "";
  const [nd_correctionPaths, set_nd_correctionPaths] = useState<string>("");

  let cf_correction: any = "";
  const [cf_correctionPaths, set_cf_correctionPaths] = useState<string>("");

  // Open a file dialog window using the tauri api and update the images array with the results
  async function dialog() {
    selected = await open({
      multiple: true,
      filters: [
        {
          name: "Image",
          extensions: ["jpg", "jpeg", "JPG", "JPEG"],
        },
      ],
    });
    if (Array.isArray(selected)) {
      assets = selected.map((item: any) => convertFileSrc(item));
      setImages(images.concat(assets));
      setDevicePaths(devicePaths.concat(selected));
      setAssetPaths(assetPaths.concat(assets));
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      assets = [convertFileSrc(selected)];
      setImages(images.concat(assets));
      setDevicePaths(devicePaths.concat([selected]));
      setAssetPaths(assetPaths.concat(assets));
    }
    if (DEBUG) {
      console.log("Dialog function called.");
      console.log("selected: ", selected);
      console.log("assets: ", assets);
    }
  }

  async function dialogBatchProcessing() {
    selected = await open({
      multiple: true,
      directory: true,
    });
    if (selected === null) {
      // user cancelled the selection
    } else if (Array.isArray(selected)) {
      assets = selected.map((item: any) => convertFileSrc(item));
      setImages(images.concat(assets));
      setDevicePaths(devicePaths.concat(selected));
      setAssetPaths(assetPaths.concat(assets));
    }
    else {
      assets = [convertFileSrc(selected)];
      setImages(images.concat(assets));
      setDevicePaths(devicePaths.concat([selected]));
      setAssetPaths(assetPaths.concat(assets));
    }
    if (DEBUG) {
      console.log("directories selected in batch processing dialog: ", selected);
    }
  }

  async function dialogResponse() {
    response = await open({
      multiple: true,
    });
    if (response === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      setResponsePaths(response[0]);
    }
    if (DEBUG) {
      console.log("response: ", response);
    }
  }

  async function dialogFE() {
    fe_correction = await open({
      multiple: true,
    });
    if (fe_correction === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      set_fe_correctionPaths(fe_correction[0]);
    }
    if (DEBUG) {
      console.log("fe_correction: ", fe_correction);
    }
  }

  async function dialogV() {
    v_correction = await open({
      multiple: true,
    });
    if (v_correction === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      set_v_correctionPaths(v_correction[0]);
    }
    if (DEBUG) {
      console.log("v_correction: ", v_correction);
    }
  }

  async function dialogND() {
    nd_correction = await open({
      multiple: true,
    });
    if (nd_correction === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      set_nd_correctionPaths(nd_correction[0]);
    }
    if (DEBUG) {
      console.log("nd_correction: ", nd_correction);
    }
  }

  async function dialogCF() {
    cf_correction = await open({
      multiple: true,
    });
    if (cf_correction === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      set_cf_correctionPaths(cf_correction[0]);
    }
    if (DEBUG) {
      console.log("cf_correction: ", cf_correction);
    }
  }

  const [images, setImages] = useState<File[]>([]);

  const handleImageDelete = (index: number) => {
    const updatedImages = images.slice();
    const updatedDevicePaths = devicePaths.slice();
    const updatedAssetPaths = assetPaths.slice();
    updatedImages.splice(index, 1);
    updatedDevicePaths.splice(index, 1);
    updatedAssetPaths.splice(index, 1);
    setImages(updatedImages);
    setDevicePaths(updatedDevicePaths);
    setAssetPaths(updatedAssetPaths);
  };

  const handleResponseDelete = () => {
    setResponsePaths("");
  };

  const handle_fe_delete = () => {
    set_fe_correctionPaths("");
  };

  const handle_v_delete = () => {
    set_v_correctionPaths("");
  };

  const handle_nd_delete = () => {
    set_nd_correctionPaths("");
  };

  const handle_cf_delete = () => {
    set_cf_correctionPaths("");
  };

  if (DEBUG) {
    useEffect(() => {
      console.log("Updated devicePaths: ", devicePaths);
    }, [devicePaths]);

    useEffect(() => {
      console.log("Updated assetPaths: ", assetPaths);
    }, [assetPaths]);
  }

  // Update view settings (for cropping, resizing, header editing)
  // when the user enters updates a number input
  const handleViewSettingsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedViewSettings = JSON.parse(JSON.stringify(viewSettings));
    updatedViewSettings[event.currentTarget.name] = event.currentTarget.value;
    setViewSettings(updatedViewSettings);
  };

  // === Define hardcoded data for testing ===

  // Hardcoded radiance and hdrgen paths for testing
  const fakeRadiancePath = "/usr/local/radiance/bin/";
  const fakeHdrgenPath = "/usr/local/bin/";
  // Hardcoded output path
  const fakeOutputPath = "../output/";

  // Hardcoded temp path
  const fakeTempPath = "../tmp/";

  // Calls the BE pipeline function with the input images the user
  // selected, and hardcoded data for the rest of the inputs
  const handleGenerateHDRImage = () => {
    invoke<string>("pipeline", {
      radiancePath: settings.radiancePath,
      hdrgenPath: settings.hdrgenPath,
      outputPath: settings.outputPath,
      tempPath: settings.tempPath,
      inputImages: devicePaths,
      responseFunction: responsePaths,
      fisheyeCorrectionCal: fe_correctionPaths,
      vignettingCorrectionCal: v_correctionPaths,
      photometricAdjustmentCal: cf_correctionPaths,
      neutralDensityCal: nd_correctionPaths,
      diameter: viewSettings.diameter,
      xleft: viewSettings.xleft,
      ydown: viewSettings.ydown,
      xdim: viewSettings.targetRes,
      ydim: viewSettings.targetRes,
      verticalAngle: viewSettings.vv,
      horizontalAngle: viewSettings.vh,
    })
      .then((result) => console.log("Success. Result: ", result))
      .catch(console.error);
  };

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    radiancePath: "/usr/local/radiance/bin/",
    hdrgenPath: "/usr/local/bin/",
    outputPath: "/home/hdri-app/",
    tempPath: "/tmp/",
  });

  const handleSettingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSettings = JSON.parse(JSON.stringify(settings));
    updatedSettings[event.currentTarget.name] = event.currentTarget.value;
    setSettings(updatedSettings);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
          onClick={() => setShowSettings((prev) => !prev)}
        >
          Settings
        </button>
      </div>

      {showSettings ? (
        <SettingsModal
          settings={settings}
          handleChange={handleSettingsChange}
          toggleModal={() => setShowSettings((prev) => !prev)}
        />
      ) : (
        <></>
      )}

      <h1>HDRICalibrationTool</h1>
      <div>
        <h2>Image Upload</h2>

        <button
          onClick={dialog}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Select Files
        </button>
        <button
          onClick={dialogBatchProcessing}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Select Files for Batch Processing
        </button>
        <div>Image count: {images.length}</div>
        <div className="image-preview flex flex-wrap">
          {images.map((image, index) => (
            <div key={index} className="image-item">
              <div>
                <img
                  src={String(image)}
                  alt={`Image ${index}`}
                  width={200}
                  height={200}
                />
                <button onClick={() => handleImageDelete(index)}>Delete</button>
                <div>{image.name}</div>
              </div>
            </div>
          ))}
        </div>
        <h2>Response Path Upload</h2>
        <button
          onClick={dialogResponse}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Select Response Files
        </button>
        <div>
          {responsePaths && (
            <div>
              {responsePaths}
              <button onClick={() => handleResponseDelete()}>
                Delete Response File
              </button>
            </div>
          )}
        </div>
        <h2>Fish Eye Correction Path Upload</h2>
        <button
          onClick={dialogFE}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Select Fish Eye Correction Files
        </button>
        <div>
          {fe_correctionPaths && (
            <div>
              {fe_correctionPaths}
              <button onClick={() => handle_fe_delete()}>
                Delete Fish Eye Correction File
              </button>
            </div>
          )}
        </div>
        <h2>Vignetting Correction Path Upload</h2>
        <button
          onClick={dialogV}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Select Vignetting Correction Files
        </button>
        <div>
          {v_correctionPaths && (
            <div>
              {v_correctionPaths}
              <button onClick={() => handle_v_delete()}>
                Delete Vignetting Correction File
              </button>
            </div>
          )}
        </div>
        <h2>Neutral Density Correction Path Upload</h2>
        <button
          onClick={dialogND}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Select Neutral Density Correction Files
        </button>
        <div>
          {nd_correctionPaths && (
            <div>
              {nd_correctionPaths}
              <button onClick={() => handle_nd_delete()}>
                Delete Neutral Density Correction File
              </button>
            </div>
          )}
        </div>
        <h2>Calibration Factor Correction Path Upload</h2>
        <button
          onClick={dialogCF}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Select Calibration Factor Correction Files
        </button>
        <div>
          {cf_correctionPaths && (
            <div>
              {cf_correctionPaths}
              <button onClick={() => handle_cf_delete()}>
                Delete Calibration Factor Correction File
              </button>
            </div>
          )}
        </div>
        <CroppingResizingViewSettings handleChange={handleViewSettingsChange} />
        <button
          onClick={handleGenerateHDRImage}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-2 border-gray-400 rounded"
        >
          Generate HDR Image
        </button>
      </div>
    </main>
  );
}
