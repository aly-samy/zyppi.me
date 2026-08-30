package me.zyppi.zqe.mobile

import android.graphics.BitmapFactory
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class FqrMobileAcceptanceTest {

    @Test
    fun testAllMobileFixtures() {
        val context = InstrumentationRegistry.getInstrumentation().context
        val assetManager = context.assets

        val manifestString = assetManager.open("manifest.json").bufferedReader().use { it.readText() }
        val manifest = JSONArray(manifestString)

        val options = BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build()
        val scanner = BarcodeScanning.getClient(options)

        println("Starting ML Kit FQR-1 acceptance scan for ${manifest.length()} fixtures...")

        for (i in 0 until manifest.length()) {
            val item: JSONObject = manifest.getJSONObject(i)
            val filename = item.getString("filename")
            val expectedResult = item.getString("expectedResult")
            val expectedBytesHex = item.getString("expectedBytesHex")
            val transformId = item.getString("transformId")

            val inputStream = assetManager.open(filename)
            val bitmap = BitmapFactory.decodeStream(inputStream)
            inputStream.close()

            val image = InputImage.fromBitmap(bitmap, 0)
            val barcodesTask = scanner.process(image)
            val barcodes: List<Barcode> = Tasks.await(barcodesTask)

            if (expectedResult == "NO_BARCODE") {
                assertEquals("Expected zero barcodes for $filename ($transformId)", 0, barcodes.size)
            } else {
                assertEquals("Expected exactly one barcode for $filename ($transformId)", 1, barcodes.size)
                val barcode = barcodes[0]

                val rawBytes = barcode.rawBytes
                checkNotNull(rawBytes) { "ML Kit returned null rawBytes for $filename" }

                val expectedBytes = hexToByteArray(expectedBytesHex)
                assertArrayEquals("Raw bytes mismatch for $filename ($transformId)", expectedBytes, rawBytes)
            }
        }
    }

    private fun hexToByteArray(hex: String): ByteArray {
        val len = hex.length
        val data = ByteArray(len / 2)
        for (i in 0 until len step 2) {
            data[i / 2] = ((Character.digit(hex[i], 16) shl 4) + Character.digit(hex[i + 1], 16)).toByte()
        }
        return data
    }
}
