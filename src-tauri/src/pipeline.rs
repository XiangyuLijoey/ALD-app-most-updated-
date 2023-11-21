mod merge_exposures;
mod nullify_exposure_value;
mod crop;
mod resize;

use merge_exposures::merge_exposures;
use nullify_exposure_value::nullify_exposure_value;
use crop::crop;
use resize::resize;

// Used to print out debug information
pub const DEBUG: bool = true;

// Struct to hold some configuration settings (e.g. path settings).
// Used when various stages of the pipeline are called.
pub struct ConfigSettings {
    radiance_path: String,
    hdrgen_path: String,
    output_path: String,
    temp_path: String,
}

// Runs the radiance and hdrgen pipeline.
// radiance_path:
//      The path to radiance binaries
// hdrgen_path:
//      The path to the hdrgen binary
// output_path: (NOT CURRENTLY USED)
//      Place for final HDR image to be stored
// temp_path: (CURRENTLY WHERE OUTPUTS ARE STORED)
//      Place for intermediate HDR image outputs to be stored
// input_images:
//      vector of the paths to the input images. Input images must be in .JPG format.
// response_function:
//      string for the path to the camera response function, must be a .rsp file
// diameter:
//      the fisheye view diameter in pixels
// xleft:
//      The x-coordinate of the bottom left corner of the circumscribed square
//      of the fisheye view (in pixels)
// ydown:
//      The y-coordinate of the bottom left corner of the circumscribed square
//      of the fisheye view (in pixels)
// xdim:
//      The x-dimensional resolution to resize the HDR image to (in pixels)
// ydim:
//      The y-dimensional resolution to resize the HDR image to (in pixels)
#[tauri::command]
pub fn pipeline(
    radiance_path: String,
    hdrgen_path: String,
    output_path: String,
    temp_path: String,
    input_images: Vec<String>,
    response_function: String,
    diameter: String,
    xleft: String,
    ydown: String,
    xdim: String,
    ydim: String,
) -> Result<String, String> {
    if DEBUG {
        println!("Pipeline module called...");
        println!("\tradiance path: {radiance_path}");
        println!("\thdrgen path: {hdrgen_path}");
        println!("\toutput path: {output_path}");
        println!("\ttemp path: {temp_path}");
        println!("\tinput images: {:?}", input_images);
        println!("\tresponse function: {response_function}");
        println!("\tdiameter: {diameter}");
        println!("\txleft: {xleft}");
        println!("\tydown: {ydown}");
    }

    // Add path to radiance and temp directory info to config settings
    let config_settings = ConfigSettings {
        radiance_path: radiance_path,
        hdrgen_path: hdrgen_path,
        output_path: output_path,
        temp_path: temp_path,
    };

    let merge_exposures_result = merge_exposures(
        &config_settings,
        input_images,
        response_function,
        format!("{}output1.hdr", config_settings.temp_path),
    );

    // If the command to merge exposures encountered an error, abort pipeline
    if merge_exposures_result.is_err() {
        return merge_exposures_result;
    };

  
    // Nullify the exposure value
    let nullify_exposure_result = nullify_exposure_value(
        &config_settings,
        format!("{}output1.hdr", config_settings.temp_path),
        format!("{}output2.hdr", config_settings.temp_path),
    );
  
    // If the command to nullify the exposure value encountered an error, abort pipeline
    if nullify_exposure_result.is_err() {
        return nullify_exposure_result;
    }

    // Crop the HDR image to a square fitting the fisheye view
    let crop_result = crop(
        &config_settings,
        format!("{}output2.hdr", config_settings.temp_path),
        format!("{}output3.hdr", config_settings.temp_path),
        diameter,
        xleft,
        ydown,
    );

    // If the cropping command encountered an error, abort pipeline
    if crop_result.is_err() {
        return crop_result;
    }

    // Resize the HDR image
    let resize_result = resize(
        &config_settings,
        format!("{}output3.hdr", config_settings.temp_path),
        format!("{}output4.hdr", config_settings.temp_path),
        xdim,
        ydim,
    );

    // Return the result of the resizing command
    return resize_result;
}
