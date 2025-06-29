package com.pageturner

import android.util.Log
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "PageTurner"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    // Consume the event on key down to prevent the default volume behavior
    if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
      return true
    }
    return super.onKeyDown(keyCode, event)
  }

  override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
    if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
      try {
        val reactContext = reactInstanceManager.currentReactContext
        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            val eventName = if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) "volumeUp" else "volumeDown"
            val params = Arguments.createMap().apply {
              putString("action", eventName)
            }
            
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("onVolumeKeyPress", params)
            
            Log.d("MainActivity", "Volume key UP event sent to JS: $eventName")
        } else {
            Log.w("MainActivity", "React context not available, ignoring volume key UP press.")
        }
      } catch (e: Exception) {
          Log.e("MainActivity", "Error sending volume key UP event to JS", e)
      }
      // Still consume the event
      return true
    }
    return super.onKeyUp(keyCode, event)
  }
}
