//! Capture native des écrans et des fenêtres pour le sélecteur de partage d'écran intégré.
//!
//! Windows et macOS uniquement. Sur les autres plateformes les commandes renvoient une erreur
//! et le frontend retombe sur le sélecteur du navigateur.

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaptureSource {
    /// "screen:<id>" ou "window:<id>"
    pub id: String,
    /// "screen" ou "window"
    pub kind: String,
    pub name: String,
    pub app_name: String,
    /// Vignette JPEG en data URL
    pub thumbnail: String,
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
mod imp {
    use super::CaptureSource;
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    use image::{imageops::FilterType, DynamicImage, ImageFormat, RgbaImage};
    use std::io::Cursor;
    use xcap::{Monitor, Window};

    const THUMBNAIL_WIDTH: u32 = 400;
    const MAX_WINDOWS: usize = 24;
    pub const DEFAULT_FRAME_WIDTH: u32 = 1600;

    fn resize_to_width(image: RgbaImage, max_width: u32) -> RgbaImage {
        let (width, height) = image.dimensions();
        if width == 0 || width <= max_width {
            return image;
        }
        let new_height = ((height as f64) * (max_width as f64) / (width as f64))
            .round()
            .max(1.0) as u32;
        image::imageops::resize(&image, max_width, new_height, FilterType::Triangle)
    }

    fn encode_jpeg(image: RgbaImage) -> Result<Vec<u8>, String> {
        let rgb = DynamicImage::ImageRgba8(image).to_rgb8();
        let mut buffer: Vec<u8> = Vec::new();
        DynamicImage::ImageRgb8(rgb)
            .write_to(&mut Cursor::new(&mut buffer), ImageFormat::Jpeg)
            .map_err(|e| e.to_string())?;
        Ok(buffer)
    }

    fn to_data_url(image: RgbaImage) -> Result<String, String> {
        let jpeg = encode_jpeg(resize_to_width(image, THUMBNAIL_WIDTH))?;
        Ok(format!("data:image/jpeg;base64,{}", STANDARD.encode(jpeg)))
    }

    pub fn list() -> Result<Vec<CaptureSource>, String> {
        let mut sources: Vec<CaptureSource> = Vec::new();

        for monitor in Monitor::all().map_err(|e| e.to_string())? {
            let Ok(id) = monitor.id() else { continue };
            let Ok(image) = monitor.capture_image() else { continue };
            let Ok(thumbnail) = to_data_url(image) else { continue };
            let name = monitor.name().unwrap_or_else(|_| format!("Écran {id}"));
            sources.push(CaptureSource {
                id: format!("screen:{id}"),
                kind: "screen".to_string(),
                name,
                app_name: String::new(),
                thumbnail,
            });
        }

        if let Ok(windows) = Window::all() {
            let mut window_count = 0;
            for window in windows {
                if window_count >= MAX_WINDOWS {
                    break;
                }
                if window.is_minimized().unwrap_or(true) {
                    continue;
                }
                let title = window.title().unwrap_or_default();
                if title.trim().is_empty() {
                    continue;
                }
                if window.width().unwrap_or(0) < 120 || window.height().unwrap_or(0) < 80 {
                    continue;
                }
                let Ok(id) = window.id() else { continue };
                let Ok(image) = window.capture_image() else { continue };
                let Ok(thumbnail) = to_data_url(image) else { continue };
                sources.push(CaptureSource {
                    id: format!("window:{id}"),
                    kind: "window".to_string(),
                    name: title,
                    app_name: window.app_name().unwrap_or_default(),
                    thumbnail,
                });
                window_count += 1;
            }
        }

        Ok(sources)
    }

    pub fn frame(id: &str, max_width: u32) -> Result<Vec<u8>, String> {
        let (kind, raw_id) = id.split_once(':').ok_or("invalid source id")?;
        let target: u32 = raw_id.parse().map_err(|_| "invalid source id")?;

        let image = match kind {
            "screen" => Monitor::all()
                .map_err(|e| e.to_string())?
                .into_iter()
                .find(|m| m.id().map_or(false, |v| v == target))
                .ok_or("screen not found")?
                .capture_image()
                .map_err(|e| e.to_string())?,
            "window" => Window::all()
                .map_err(|e| e.to_string())?
                .into_iter()
                .find(|w| w.id().map_or(false, |v| v == target))
                .ok_or("window not found")?
                .capture_image()
                .map_err(|e| e.to_string())?,
            _ => return Err("unknown source kind".to_string()),
        };

        encode_jpeg(resize_to_width(image, max_width))
    }
}

/// Liste les écrans et fenêtres partageables, avec une vignette pour chacun.
#[cfg(any(target_os = "windows", target_os = "macos"))]
#[tauri::command]
pub async fn list_capture_sources() -> Result<Vec<CaptureSource>, String> {
    tauri::async_runtime::spawn_blocking(imp::list)
        .await
        .map_err(|e| e.to_string())?
}

/// Capture une image (JPEG brut) de la source choisie. Appelée en boucle par le frontend.
#[cfg(any(target_os = "windows", target_os = "macos"))]
#[tauri::command]
pub async fn capture_source_frame(
    id: String,
    max_width: Option<u32>,
) -> Result<tauri::ipc::Response, String> {
    let width = max_width
        .unwrap_or(imp::DEFAULT_FRAME_WIDTH)
        .clamp(320, 3840);
    let bytes = tauri::async_runtime::spawn_blocking(move || imp::frame(&id, width))
        .await
        .map_err(|e| e.to_string())??;
    Ok(tauri::ipc::Response::new(bytes))
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
#[tauri::command]
pub async fn list_capture_sources() -> Result<Vec<CaptureSource>, String> {
    Err("Capture d'écran native non supportée sur cette plateforme".to_string())
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
#[tauri::command]
pub async fn capture_source_frame(
    _id: String,
    _max_width: Option<u32>,
) -> Result<tauri::ipc::Response, String> {
    Err("Capture d'écran native non supportée sur cette plateforme".to_string())
}