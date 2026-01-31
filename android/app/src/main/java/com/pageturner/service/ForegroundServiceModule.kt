package com.pageturner.service

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ForegroundServiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ForegroundServiceModule"

    @ReactMethod
    fun startService() {
        ForegroundService.startService(reactApplicationContext)
    }

    @ReactMethod
    fun stopService() {
        ForegroundService.stopService(reactApplicationContext)
    }
}
