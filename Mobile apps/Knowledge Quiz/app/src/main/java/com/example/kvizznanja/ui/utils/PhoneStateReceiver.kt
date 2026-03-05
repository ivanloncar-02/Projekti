package com.example.kvizznanja.utils

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager

class PhoneStateReceiver : BroadcastReceiver() {

    companion object {
        var onPhoneStateChanged: ((isRinging: Boolean) -> Unit)? = null
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)

            when (state) {
                TelephonyManager.EXTRA_STATE_RINGING -> {
                    // Poziv dolazi
                    onPhoneStateChanged?.invoke(true)
                }
                TelephonyManager.EXTRA_STATE_IDLE -> {
                    // Poziv je završen ili odbijen
                    onPhoneStateChanged?.invoke(false)
                }
                TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                    // Poziv u tijeku
                    onPhoneStateChanged?.invoke(true)
                }
            }
        }
    }
}