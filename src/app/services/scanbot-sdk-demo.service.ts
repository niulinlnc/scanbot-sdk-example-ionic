import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import to from 'await-to-js';

import ScanbotSdk, { DocumentScannerConfiguration, ScanbotSDKConfiguration } from 'cordova-plugin-scanbot-sdk';

import { DialogsService } from './dialogs.service';

@Injectable()
export class ScanbotSdkDemoService {

    /*
     * TODO add the license key here.
     * Please note: The Scanbot SDK will run without a license key for one minute per session!
     * After the trial period is over all Scanbot SDK functions as well as the UI components will stop working
     * or may be terminated. You can get an unrestricted "no-strings-attached" 30 day trial license key for free.
     * Please submit the trial license form (https://scanbot.io/sdk/trial.html) on our website by using
     * the app identifier "io.scanbot.example.sdk.ionic" of this example app
     * or of your app (see config.xml <widget id="your.app.id" ...>).
     */
    private readonly myLicenseKey = '';
    private _serviceInitialized = false;

    public SDK = ScanbotSdk.promisify();

    constructor(private platform: Platform,
                private dialogsService: DialogsService,
                private file: File) {
        this.platform.ready().then(() => this.initScanbotSdk());
    }

    private initScanbotSdk() {
        // optional storageBaseDirectory - see the comments below.
        // const customStorageBaseDirectory = this.getDemoStorageBaseDirectory();
        //
        // const config: ScanbotSDKConfiguration = {
        //     loggingEnabled: true, // Consider switching logging OFF in production builds for security and performance reasons!
        //     licenseKey: this.myLicenseKey,
        //     storageImageFormat: 'JPG',
        //     storageImageQuality: 80,
        //     storageBaseDirectory: customStorageBaseDirectory,
        //     documentDetectorMode: 'ML_BASED'
        // };
        //
        // return this.SDK.initializeSdk(config).then(result => {
        //     console.log(JSON.stringify(result));
        // }).catch((err) => {
        //     console.error(JSON.stringify(err));
        // });

        if (!this._serviceInitialized && this.SDK) {
            const config = {
                licenseKey: this.myLicenseKey,
                storageImageQuality: 80,
                storageImageFormat: "JPG"
            } as ScanbotSDKConfiguration;
            const [error, result] = await to(this.SDK.initializeSdk(config));
            if (result) {
                console.log("init\", \"success initializing Scanbot plugin: ")
                //   this.debug("init", "success initializing Scanbot plugin: " + JSON.stringify(result));
                this._serviceInitialized = true;
                await this.SDK.cleanup();
            } else {
                console.log("init error initializing Scanbot plugin:" )
                //      this.error("init", "error initializing Scanbot plugin: " + JSON.stringify(error));
            }
        } else {
            console.log("init, ScanbotPlugin not found")
            //    this.error("init", "ScanbotPlugin not found");
        }
        return this._serviceInitialized;

    }

    /**
     * Check Plugin initialization and license info
     */
    public async checkPlugin() {
        let isLicenseValid = false;
        if (!this._serviceInitialized) {
            await this.initScanbotSdk();
        }

        console.log(!this.SDK)
        if (!this._serviceInitialized || !this.SDK) {
            //this.error("checkPlugin", "ScanbotPlugin not found");
            console.log("ScanbotPlugin not found")
        } else {
            const [error, result] = await to(this.SDK.getLicenseInfo());
            isLicenseValid = result && result.info && result.info.isLicenseValid;
            if (isLicenseValid) {
                console.log("success checking Scanbot License:")
                //  this.debug("checkPlugin", "success checking Scanbot License: " + JSON.stringify(result));
            } else {
                //this.error("checkPlugin", "error checking Scanbot License: " + JSON.stringify(error));
                console.log("error checking Scanbot License")
            }
        }
        return isLicenseValid;
    }

    private getDemoStorageBaseDirectory(): string {
        // tslint:disable:max-line-length
        // !! Please note !!
        // It is strongly recommended to use the default (secure) storage location of the Scanbot SDK.
        // However, for demo purposes we overwrite the "storageBaseDirectory" of the Scanbot SDK by a custom storage directory.
        //
        // On Android we use the "externalDataDirectory" which is a public(!) folder.
        // All image files and export files (PDF, TIFF, etc) created by the Scanbot SDK in this demo app will be stored
        // in this public storage directory and will be accessible for every(!) app having external storage permissions!
        // Again, this is only for demo purposes, which allows us to easily fetch and check the generated files
        // via Android "adb" CLI tools, Android File Transfer app, Android Studio, etc.
        //
        // On iOS we use the "documentsDirectory" which is accessible via iTunes file sharing.
        //
        // For more details about the storage system of the Scanbot SDK Plugin please see our docs:
        // - https://scanbotsdk.github.io/documentation/cordova/
        //
        // For more details about the file system on Android and iOS we also recommend to check out:
        // - https://developer.android.com/guide/topics/data/data-storage
        // - https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html
        // tslint:enable:max-line-length

        if (this.platform.is('android')) {
            return this.file.externalDataDirectory + 'my-custom-storage';
        } else if (this.platform.is('ios')) {
            return this.file.documentsDirectory + 'my-custom-storage';
        }
        return null;
    }

    public async checkLicense() {
        const result = await this.SDK.getLicenseInfo();

        if (result.info.isLicenseValid) {
            // OK - we have a trial session, a valid trial license or valid production license.
            return true;
        }
        await this.dialogsService.showAlert('Scanbot SDK (trial) license has expired!');
        return false;
    }

    public globalDocScannerConfigs(): DocumentScannerConfiguration {
        return {
            // Customize colors, text resources, behavior, etc..
            cameraPreviewMode: 'FIT_IN',
            orientationLockMode: 'PORTRAIT',
            pageCounterButtonTitle: '%d Page(s)',
            multiPageEnabled: true,
            ignoreBadAspectRatio: true,
            topBarBackgroundColor: '#c8193c',
            bottomBarBackgroundColor: '#c8193c',
            // maxNumberOfPages: 3,
            // documentImageSizeLimit: { width: 1500, height: 2000 },
            // shutterButtonHidden: true,
            // see further configs ...
        };
    }
}
