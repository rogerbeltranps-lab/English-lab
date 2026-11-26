# Model final product videos (free voices)

Turns each LS model final product page (`<course>/<ls>/<route>-model.html`: slides + speaking script in its `notes` array)
into a video with sound and captions, shown on that page by `shared/js/el-model-video.js`.

1. Voices: one Kokoro voice per speaker in `voices.json` (key `<course>-<route>`; a group line such as "All together" takes a list and is shared out sentence by sentence).
2. `venv/bin/python tools/model-video/voice.py <kokoro-v1.0.onnx> <voices-v1.0.bin> <page>` (setup as in `tools/voice/generate.py`; model files from GitHub, thewh1teagle/kokoro-onnx release model-files-v1.0).
3. `node tools/model-video/build.js <page>` → `<ls>/video/<route>-model.mp4`, `-model.vtt`, `-model-poster.jpg`.
4. Add `<script src="../../shared/js/el-model-video.js" data-video="video/<route>-model.mp4" data-who="Arnau’s vlog" defer></script>` after `el-route-names.js` (`data-ca="1"` on Base pages; bump `data-v` after a rebuild).

`out/` (wav + screenshots) is scratch and not committed. Nothing here calls a paid service.
