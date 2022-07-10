package me.sayantam.qr

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import com.google.zxing.integration.android.IntentIntegrator
import retrofit2.*
import retrofit2.converter.scalars.ScalarsConverterFactory
import retrofit2.http.POST
import retrofit2.http.Query

interface AuthService {
    @POST("/login")
    fun login(@Query("sessionId") sessionId: String,
              @Query("userName") userName: String): Call<String>
}

class MainActivity : AppCompatActivity() {

    private var userName: String? = null

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl("http://192.168.1.11:3000")
            .addConverterFactory(ScalarsConverterFactory.create())
            .build()
    }

    private val authService by lazy {
        retrofit.create(AuthService::class.java)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val qrButton: ImageButton = findViewById(R.id.qrButton)
        qrButton.setOnClickListener {
            val intentIntegrator = IntentIntegrator(this)
            intentIntegrator.setDesiredBarcodeFormats(listOf(IntentIntegrator.QR_CODE))
            intentIntegrator.initiateScan()
        }

        val userNameField: EditText = findViewById(R.id.userName)
        val loginButton: Button = findViewById(R.id.login)
        loginButton.setOnClickListener {
            this.userName = userNameField.text.toString()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        val result = IntentIntegrator.parseActivityResult(resultCode, data)
        if (result != null && this.userName != null) {
            val textView = findViewById<TextView>(R.id.textView)
            textView.text = result.contents
            val call = authService.login(result.contents, this.userName.toString())
            call.enqueue(object : Callback<String> {
                override fun onResponse(call: Call<String>, response: Response<String>) {
                    Log.d("MainActivity", response.body() ?: "<empty response>")
                }

                override fun onFailure(call: Call<String>, t: Throwable) {
                    Log.e("MainActivity", "Failed to login", t)
                }
            })
        }
    }
}
