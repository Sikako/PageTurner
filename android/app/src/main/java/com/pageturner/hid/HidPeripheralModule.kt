package com.pageturner.hid

import android.bluetooth.*
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*

class HidPeripheralModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "HidPeripheralModule"

    private val context: Context = reactContext
    private val bluetoothManager: BluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager.adapter
    private var gattServer: BluetoothGattServer? = null
    private var advertiser: BluetoothLeAdvertiser? = null
    private val connectedDevices = mutableMapOf<String, BluetoothDevice>()
    private var targetDevice: BluetoothDevice? = null

    // Standard HID Service UUIDs and Report Map for a generic keyboard
    companion object {
        val HID_SERVICE_UUID: UUID = UUID.fromString("00001812-0000-1000-8000-00805f9b34fb")
        val REPORT_MAP_UUID: UUID = UUID.fromString("00002a4b-0000-1000-8000-00805f9b34fb")
        val REPORT_UUID: UUID = UUID.fromString("00002a4d-0000-1000-8000-00805f9b34fb")
        val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")
        
        // A very basic report map for a keyboard with one key
        val REPORT_MAP = byteArrayOf(
            0x05, 0x01, // Usage Page (Generic Desktop)
            0x09, 0x06, // Usage (Keyboard)
            0xA1.toByte(), 0x01, // Collection (Application)
            0x05, 0x07, // Usage Page (Key Codes)
            0x19.toByte(), 0xE0.toByte(), // Usage Minimum (224)
            0x29.toByte(), 0xE7.toByte(), // Usage Maximum (231)
            0x15.toByte(), 0x00, // Logical Minimum (0)
            0x25.toByte(), 0x01, // Logical Maximum (1)
            0x75.toByte(), 0x01, // Report Size (1)
            0x95.toByte(), 0x08, // Report Count (8)
            0x81.toByte(), 0x02, // Input (Data, Variable, Absolute)
            0x95.toByte(), 0x01, // Report Count (1)
            0x75.toByte(), 0x08, // Report Size (8)
            0x81.toByte(), 0x01, // Input (Constant)
            0x95.toByte(), 0x05, // Report Count (5)
            0x75.toByte(), 0x01, // Report Size (1)
            0x05, 0x08, // Usage Page (LEDs)
            0x19.toByte(), 0x01, // Usage Minimum (1)
            0x29.toByte(), 0x05, // Usage Maximum (5)
            0x91.toByte(), 0x02, // Output (Data, Variable, Absolute)
            0x95.toByte(), 0x01, // Report Count (1)
            0x75.toByte(), 0x03, // Report Size (3)
            0x91.toByte(), 0x01, // Output (Constant)
            0x95.toByte(), 0x06, // Report Count (6)
            0x75.toByte(), 0x08, // Report Size (8)
            0x15.toByte(), 0x00, // Logical Minimum (0)
            0x25.toByte(), 0x65, // Logical Maximum (101)
            0x05, 0x07, // Usage Page (Key Codes)
            0x19.toByte(), 0x00, // Usage Minimum (0)
            0x29.toByte(), 0x65, // Usage Maximum (101)
            0x81.toByte(), 0x00, // Input (Data, Array)
            0xC0.toByte()  // End Collection
        )
    }

    @ReactMethod
    fun start(promise: Promise) {
        Log.d("HidPeripheralModule", "Starting peripheral mode...")
        // TODO: Add permission checks for new Android versions
        
        gattServer = bluetoothManager.openGattServer(context, gattServerCallback)
        if (gattServer == null) {
            Log.e("HidPeripheralModule", "Failed to open GATT server")
            promise.reject("GATT_SERVER_ERROR", "Failed to open GATT server")
            return
        }
        Log.d("HidPeripheralModule", "GATT server opened")

        val hidService = createHidService()
        gattServer?.addService(hidService)
        Log.d("HidPeripheralModule", "HID service added")

        advertiser = bluetoothAdapter?.bluetoothLeAdvertiser
        if (advertiser == null) {
            Log.e("HidPeripheralModule", "Failed to create advertiser")
            promise.reject("ADVERTISER_ERROR", "Failed to create advertiser")
            return
        }
        Log.d("HidPeripheralModule", "Advertiser created")

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(true)
            .build()
        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .addServiceUuid(ParcelUuid(HID_SERVICE_UUID))
            .build()
        
        // Do not set a custom name, use the system default
        advertiser?.startAdvertising(settings, data, advertiseCallback)
        Log.d("HidPeripheralModule", "Advertising started...")
        promise.resolve(null)
    }

    @ReactMethod
    fun stop() {
        // Keep the server running, but stop advertising if needed.
        // In this app's logic, we might not even need a manual stop.
        advertiser?.stopAdvertising(advertiseCallback)
        Log.d("HidPeripheralModule", "Advertising stopped by JS call.")
    }

    @ReactMethod
    fun setTargetDevice(address: String, promise: Promise) {
        targetDevice = connectedDevices[address]
        if (targetDevice != null) {
            Log.d("HidPeripheralModule", "Target device set to: ${targetDevice?.name}")
            promise.resolve(true)
        } else {
            Log.e("HidPeripheralModule", "Could not find device with address: $address")
            promise.reject("NOT_FOUND", "Device not found or not connected.")
        }
    }

    @ReactMethod
    fun sendKeyPress(keyCode: Int, promise: Promise) {
        if (targetDevice == null) {
            promise.reject("NO_TARGET", "No target device selected.")
            return
        }

        val report = ByteArray(8) { 0 }
        report[2] = keyCode.toByte()
        
        val characteristic = gattServer?.getService(HID_SERVICE_UUID)?.getCharacteristic(REPORT_UUID)
        characteristic?.value = report
        
        gattServer?.notifyCharacteristicChanged(targetDevice, characteristic, false)

        // Send key release
        Handler(Looper.getMainLooper()).postDelayed({
            report.fill(0)
            characteristic?.value = report
            gattServer?.notifyCharacteristicChanged(targetDevice, characteristic, false)
        }, 50)
        promise.resolve(null)
    }

    private fun createHidService(): BluetoothGattService {
        val service = BluetoothGattService(HID_SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        
        // Report Map Characteristic
        val reportMap = BluetoothGattCharacteristic(REPORT_MAP_UUID, BluetoothGattCharacteristic.PROPERTY_READ, BluetoothGattCharacteristic.PERMISSION_READ)
        reportMap.value = REPORT_MAP
        service.addCharacteristic(reportMap)

        // Report Characteristic
        val report = BluetoothGattCharacteristic(REPORT_UUID,
            BluetoothGattCharacteristic.PROPERTY_READ or BluetoothGattCharacteristic.PROPERTY_NOTIFY,
            BluetoothGattCharacteristic.PERMISSION_READ)
        // Add CCCD to allow notifications
        report.addDescriptor(BluetoothGattDescriptor(CCCD_UUID, BluetoothGattDescriptor.PERMISSION_READ or BluetoothGattDescriptor.PERMISSION_WRITE))
        service.addCharacteristic(report)

        return service
    }

    private fun sendConnectionStateChangeEvent(status: String, device: BluetoothDevice) {
        val params = Arguments.createMap().apply {
            putString("status", status)
            putString("address", device.address)
            putString("name", device.name ?: device.address)
        }
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onHidConnectionStateChanged", params)
    }

    private val gattServerCallback = object : BluetoothGattServerCallback() {
        override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                Log.d("HidPeripheralModule", "Device connected: ${device.address}")
                connectedDevices[device.address] = device
                sendConnectionStateChangeEvent("connected", device)
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                Log.d("HidPeripheralModule", "Device disconnected: ${device.address}")
                connectedDevices.remove(device.address)
                if (targetDevice?.address == device.address) {
                    targetDevice = null
                }
                sendConnectionStateChangeEvent("disconnected", device)
            }
        }

        override fun onDescriptorWriteRequest(device: BluetoothDevice, requestId: Int, descriptor: BluetoothGattDescriptor, preparedWrite: Boolean, responseNeeded: Boolean, offset: Int, value: ByteArray) {
            super.onDescriptorWriteRequest(device, requestId, descriptor, preparedWrite, responseNeeded, offset, value)
            if (descriptor.uuid == CCCD_UUID) {
                if (Arrays.equals(value, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)) {
                    Log.d("HidPeripheralModule", "Device ${device.name} subscribed to notifications.")
                    // Here we could potentially confirm the device as a target automatically
                } else if (Arrays.equals(value, BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE)) {
                    Log.d("HidPeripheralModule", "Device ${device.name} unsubscribed from notifications.")
                }
            }
            if (responseNeeded) {
                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
            }
        }
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            super.onStartSuccess(settingsInEffect)
            Log.d("HidPeripheralModule", "Advertising successfully started")
        }

        override fun onStartFailure(errorCode: Int) {
            super.onStartFailure(errorCode)
            Log.e("HidPeripheralModule", "Advertising failed with error code: $errorCode")
            // We can pass this error code back to JS if needed
        }
    }
}