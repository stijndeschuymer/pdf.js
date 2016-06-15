/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* globals DEFAULT_URL, PDFBug, Stats */

'use strict';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('pdfjs-web/app', ['exports', 'pdfjs-web/ui_utils',
      'pdfjs-web/download_manager', 'pdfjs-web/pdf_history',
      'pdfjs-web/preferences', 'pdfjs-web/pdf_sidebar',
      'pdfjs-web/view_history', 'pdfjs-web/pdf_thumbnail_viewer',
      'pdfjs-web/secondary_toolbar', 'pdfjs-web/password_prompt',
      'pdfjs-web/pdf_presentation_mode', 'pdfjs-web/pdf_document_properties',
      'pdfjs-web/hand_tool', 'pdfjs-web/pdf_viewer',
      'pdfjs-web/pdf_rendering_queue', 'pdfjs-web/pdf_link_service',
      'pdfjs-web/pdf_outline_viewer', 'pdfjs-web/overlay_manager',
      'pdfjs-web/pdf_attachment_viewer', 'pdfjs-web/pdf_find_controller',
      'pdfjs-web/pdf_find_bar', 'pdfjs-web/dom_events', 'pdfjs-web/pdfjs'],
      factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./ui_utils.js'), require('./download_manager.js'),
      require('./pdf_history.js'), require('./preferences.js'),
      require('./pdf_sidebar.js'), require('./view_history.js'),
      require('./pdf_thumbnail_viewer.js'), require('./secondary_toolbar.js'),
      require('./password_prompt.js'), require('./pdf_presentation_mode.js'),
      require('./pdf_document_properties.js'), require('./hand_tool.js'),
      require('./pdf_viewer.js'), require('./pdf_rendering_queue.js'),
      require('./pdf_link_service.js'), require('./pdf_outline_viewer.js'),
      require('./overlay_manager.js'), require('./pdf_attachment_viewer.js'),
      require('./pdf_find_controller.js'), require('./pdf_find_bar.js'),
      require('./dom_events.js'), require('./pdfjs.js'));
  } else {
    factory((root.pdfjsWebApp = {}), root.pdfjsWebUIUtils,
      root.pdfjsWebDownloadManager, root.pdfjsWebPDFHistory,
      root.pdfjsWebPreferences, root.pdfjsWebPDFSidebar,
      root.pdfjsWebViewHistory, root.pdfjsWebPDFThumbnailViewer,
      root.pdfjsWebSecondaryToolbar, root.pdfjsWebPasswordPrompt,
      root.pdfjsWebPDFPresentationMode, root.pdfjsWebPDFDocumentProperties,
      root.pdfjsWebHandTool, root.pdfjsWebPDFViewer,
      root.pdfjsWebPDFRenderingQueue, root.pdfjsWebPDFLinkService,
      root.pdfjsWebPDFOutlineViewer, root.pdfjsWebOverlayManager,
      root.pdfjsWebPDFAttachmentViewer, root.pdfjsWebPDFFindController,
      root.pdfjsWebPDFFindBar, root.pdfjsWebDOMEvents, root.pdfjsWebPDFJS);
  }
}(this, function (exports, uiUtilsLib, downloadManagerLib, pdfHistoryLib,
                  preferencesLib, pdfSidebarLib, viewHistoryLib,
                  pdfThumbnailViewerLib, secondaryToolbarLib, passwordPromptLib,
                  pdfPresentationModeLib, pdfDocumentPropertiesLib, handToolLib,
                  pdfViewerLib, pdfRenderingQueueLib, pdfLinkServiceLib,
                  pdfOutlineViewerLib, overlayManagerLib,
                  pdfAttachmentViewerLib, pdfFindControllerLib, pdfFindBarLib,
                  domEventsLib, pdfjsLib) {

const UNKNOWN_SCALE = uiUtilsLib.UNKNOWN_SCALE;
const DEFAULT_SCALE_VALUE = uiUtilsLib.DEFAULT_SCALE_VALUE;
const ProgressBar = uiUtilsLib.ProgressBar;
const getPDFFileNameFromURL = uiUtilsLib.getPDFFileNameFromURL;
const noContextMenuHandler = uiUtilsLib.noContextMenuHandler;
const mozL10n = uiUtilsLib.mozL10n;
const parseQueryString = uiUtilsLib.parseQueryString;
const PDFHistory = pdfHistoryLib.PDFHistory;
const Preferences = preferencesLib.Preferences;
const SidebarView = pdfSidebarLib.SidebarView;
const PDFSidebar = pdfSidebarLib.PDFSidebar;
const ViewHistory = viewHistoryLib.ViewHistory;
const PDFThumbnailViewer = pdfThumbnailViewerLib.PDFThumbnailViewer;
const SecondaryToolbar = secondaryToolbarLib.SecondaryToolbar;
const PasswordPrompt = passwordPromptLib.PasswordPrompt;
const PDFPresentationMode = pdfPresentationModeLib.PDFPresentationMode;
const PDFDocumentProperties = pdfDocumentPropertiesLib.PDFDocumentProperties;
const HandTool = handToolLib.HandTool;
const PresentationModeState = pdfViewerLib.PresentationModeState;
const PDFViewer = pdfViewerLib.PDFViewer;
const RenderingStates = pdfRenderingQueueLib.RenderingStates;
const PDFRenderingQueue = pdfRenderingQueueLib.PDFRenderingQueue;
const PDFLinkService = pdfLinkServiceLib.PDFLinkService;
const PDFOutlineViewer = pdfOutlineViewerLib.PDFOutlineViewer;
const OverlayManager = overlayManagerLib.OverlayManager;
const PDFAttachmentViewer = pdfAttachmentViewerLib.PDFAttachmentViewer;
const PDFFindController = pdfFindControllerLib.PDFFindController;
const PDFFindBar = pdfFindBarLib.PDFFindBar;
const getGlobalEventBus = domEventsLib.getGlobalEventBus;
const EventBus = uiUtilsLib.EventBus;

const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 10.0;
const SCALE_SELECT_CONTAINER_PADDING = 8;
const SCALE_SELECT_PADDING = 22;
const PAGE_NUMBER_LOADING_INDICATOR = 'visiblePageIsLoading';
const DISABLE_AUTO_FETCH_LOADING_BAR_TIMEOUT = 5000;

const DefaultExernalServices = {
    updateFindControlState: function (data) {},
    initPassiveLoading: function (callbacks) {},
    fallback: function (data, callback) {},
    reportTelemetry: function (data) {},
    createDownloadManager: function () {
        return new downloadManagerLib.DownloadManager();
    },
    supportsIntegratedFind: false,
    supportsDocumentFonts: true,
    supportsDocumentColors: true,
    supportedMouseWheelZoomModifierKeys: {
        ctrlKey: true,
        metaKey: true,
    }
};

function configure(PDFJS) {
  PDFJS.imageResourcesPath = './images/';
//#if (FIREFOX || MOZCENTRAL || GENERIC || CHROME)
//PDFJS.workerSrc = '../build/pdf.worker.js';
//#endif
//#if !PRODUCTION
  PDFJS.cMapUrl = '../external/bcmaps/';
  PDFJS.cMapPacked = true;
  PDFJS.workerSrc = '../src/worker_loader.js';
//#else
//PDFJS.cMapUrl = '../web/cmaps/';
//PDFJS.cMapPackeds = true;
//#endif
}

class PDFViewerApplication {
    constructor() {
        this.initialBookmark = document.location.hash.substring(1);
        this.initialDestination = null;
        this.initialized = false;
        this.fellback = false;
        this.appConfig = null;
        this.pdfDocument = null;
        this.pdfLoadingTask = null;
        this.printing = false;
        /** @type {PDFViewer} */
        this.pdfViewer = null;
        /** @type {PDFThumbnailViewer} */
        this.pdfThumbnailViewer = null;
        /** @type {PDFRenderingQueue} */
        this.pdfRenderingQueue = null;
        /** @type {PDFPresentationMode} */
        this.pdfPresentationMode = null;
        /** @type {PDFDocumentProperties} */
        this.pdfDocumentProperties = null;
        /** @type {PDFLinkService} */
        this.pdfLinkService = null;
        /** @type {PDFHistory} */
        this.pdfHistory = null;
        /** @type {PDFSidebar} */
        this.pdfSidebar = null;
        /** @type {PDFOutlineViewer} */
        this.pdfOutlineViewer = null;
        /** @type {PDFAttachmentViewer} */
        this.pdfAttachmentViewer = null;
        /** @type {ViewHistory} */
        this.store = null;
        /** @type {DownloadManager} */
        this.downloadManager = null;
        /** @type {EventBus} */
        this.eventBus = null;
        this.pageRotation = 0;
        this.isInitialViewSet = false;
        this.animationStartedPromise = new Promise((resolve) => {
            window.requestAnimationFrame(resolve);
        });
        this.preferenceSidebarViewOnLoad = SidebarView.NONE;
        this.preferencePdfBugEnabled = false;
        this.preferenceShowPreviousViewOnLoad = true;
        this.preferenceDefaultZoomValue = '';
        this.zoomDisabled = false;
        this.zoomDisabledTimeout = null;
        this.isViewerEmbedded = window.parent !== window;
        this.url =  '';
        this.externalServices = DefaultExernalServices;
    }

    initialize(appConfig) {
        //configure(pdfjsLib.PDFJS);
        this.appConfig = appConfig;

        const eventBus = appConfig.eventBus ? getGlobalEventBus() : new EventBus();
        this.eventBus = eventBus;
        this.bindEvents();
        this.addEventListeners();

        const pdfRenderingQueue = new PDFRenderingQueue();
        pdfRenderingQueue.onIdle = this.cleanup.bind(this);
        this.pdfRenderingQueue = pdfRenderingQueue;

        const pdfLinkService = new PDFLinkService({
            eventBus
        });
        this.pdfLinkService = pdfLinkService;

        const downloadManager = this.externalServices.createDownloadManager();
        this.downloadManager = downloadManager;

        const container = appConfig.mainContainer;
        this.container = container;
        const viewer = appConfig.viewerContainer;
        const innerContainer = appConfig.innerContainer;
        this.pdfViewer = new PDFViewer({
            container,
            innerContainer,
            viewer,
            eventBus,
            renderingQueue: pdfRenderingQueue,
            linkService: pdfLinkService,
            downloadManager
        });
        pdfRenderingQueue.setViewer(this.pdfViewer);
        pdfLinkService.setViewer(this.pdfViewer);

        const thumbnailContainer = appConfig.sidebar.thumbnailView;
        this.pdfThumbnailViewer = new PDFThumbnailViewer({
            container: thumbnailContainer,
            renderingQueue: pdfRenderingQueue,
            linkService: pdfLinkService
        });
        pdfRenderingQueue.setThumbnailViewer(this.pdfThumbnailViewer);

        Preferences.initialize();
        this.preferences = Preferences;

        this.pdfHistory = new PDFHistory({
            linkService: pdfLinkService,
            eventBus: this.eventBus
        });
        pdfLinkService.setHistory(this.pdfHistory);

        this.findController = new PDFFindController({
            pdfViewer: this.pdfViewer
        });
        this.findController.onUpdateResultsCount = (matchCount) => {
            if (this.supportsIntegratedFind) {
                return;
            }
            this.findBar.updateResultsCount(matchCount);
        };
        this.findController.onUpdateState = (state, previous, matchCount) => {
            if (this.supportsIntegratedFind) {
                this.externalServices.updateFindControlState({result: state, findPrevious: previous});
            } else {
                this.findBar.updateUIState(state, previous, matchCount);
            }
        };

        this.pdfViewer.setFindController(this.findController);

        // FIXME better PDFFindBar constructor parameters
        var findBarConfig = Object.create(appConfig.findBar);
        findBarConfig.findController = this.findController;
        findBarConfig.eventBus = this.eventBus;
        this.findBar = new PDFFindBar(findBarConfig);

        this.overlayManager = OverlayManager;

        this.handTool = new HandTool({
            container: container,
            eventBus: this.eventBus,
        });

        this.pdfDocumentProperties =
        new PDFDocumentProperties(appConfig.documentProperties);

        this.secondaryToolbar =
        new SecondaryToolbar(appConfig.secondaryToolbar, eventBus);

        if (this.supportsFullscreen) {
            this.pdfPresentationMode = new PDFPresentationMode({
                container: container,
                viewer: viewer,
                pdfViewer: this.pdfViewer,
                eventBus: this.eventBus,
                contextMenuItems: appConfig.fullscreen
            });
        }

        this.passwordPrompt = new PasswordPrompt(appConfig.passwordOverlay);

        this.pdfOutlineViewer = new PDFOutlineViewer({
            container: appConfig.sidebar.outlineView,
            eventBus: this.eventBus,
            linkService: pdfLinkService,
        });

        this.pdfAttachmentViewer = new PDFAttachmentViewer({
            container: appConfig.sidebar.attachmentsView,
            eventBus: this.eventBus,
            downloadManager: downloadManager
        });

        // FIXME better PDFSidebar constructor parameters
        const sidebarConfig = Object.create(appConfig.sidebar);
        sidebarConfig.pdfViewer = this.pdfViewer;
        sidebarConfig.pdfThumbnailViewer = this.pdfThumbnailViewer;
        sidebarConfig.pdfOutlineViewer = this.pdfOutlineViewer;
        sidebarConfig.eventBus = this.eventBus;
        this.pdfSidebar = new PDFSidebar(sidebarConfig);
        this.pdfSidebar.onToggled = this.forceRendering.bind(this);

        const PDFJS = pdfjsLib.PDFJS;
        const initializedPromise = Promise.all([
            Preferences.get('enableWebGL').then((value) => {
                PDFJS.disableWebGL = !value;
            }),
            Preferences.get('sidebarViewOnLoad').then((value) => {
                this.preferenceSidebarViewOnLoad = value;
            }),
            Preferences.get('pdfBugEnabled').then((value) => {
                this.preferencePdfBugEnabled = value;
            }),
            Preferences.get('showPreviousViewOnLoad').then((value) => {
                this.preferenceShowPreviousViewOnLoad = value;
            }),
            Preferences.get('defaultZoomValue').then((value) => {
                this.preferenceDefaultZoomValue = value;
            }),
            Preferences.get('disableTextLayer').then((value) => {
                if (PDFJS.disableTextLayer === true) {
                    return;
                }
                PDFJS.disableTextLayer = value;
            }),
            Preferences.get('disableRange').then((value) => {
                if (PDFJS.disableRange === true) {
                    return;
                }
                PDFJS.disableRange = value;
            }),
            Preferences.get('disableStream').then((value) => {
                if (PDFJS.disableStream === true) {
                    return;
                }
                PDFJS.disableStream = value;
            }),
            Preferences.get('disableAutoFetch').then((value) => {
                PDFJS.disableAutoFetch = value;
            }),
            Preferences.get('disableFontFace').then((value) => {
                if (PDFJS.disableFontFace === true) {
                    return;
                }
                PDFJS.disableFontFace = value;
            }),
            Preferences.get('useOnlyCssZoom').then((value) => {
                PDFJS.useOnlyCssZoom = value;
            }),
            Preferences.get('externalLinkTarget').then((value) => {
                if (PDFJS.isExternalLinkTargetSet()) {
                    return;
                }
                PDFJS.externalLinkTarget = value;
            }),
            // TODO move more preferences and other async stuff here
        ]).catch((reason) => { });

        return initializedPromise.then(() => {
            if (this.isViewerEmbedded && !PDFJS.isExternalLinkTargetSet()) {
                // Prevent external links from "replacing" the viewer,
                // when it's embedded in e.g. an iframe or an object.
                PDFJS.externalLinkTarget = PDFJS.LinkTarget.TOP;
            }

            this.initialized = true;
        });
    }

    run(config) {
        this.initialize(config)
            .then(this.webViewerInitialized.bind(this));
    }

    zoomIn(ticks) {
        let newScale = this.pdfViewer.currentScale;
        do {
            newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
            newScale = Math.ceil(newScale * 10) / 10;
            newScale = Math.min(MAX_SCALE, newScale);
        } while (--ticks > 0 && newScale < MAX_SCALE);
        this.pdfViewer.currentScaleValue = newScale;
    }

    zoomOut(ticks) {
        let newScale = this.pdfViewer.currentScale;
        do {
            newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
            newScale = Math.floor(newScale * 10) / 10;
            newScale = Math.max(MIN_SCALE, newScale);
        } while (--ticks > 0 && newScale > MIN_SCALE);
        this.pdfViewer.currentScaleValue = newScale;
    }

    get pagesCount() {
        return this.pdfDocument.numPages;
    }

    set page(val) {
        this.pdfLinkService.page = val;
    }

    get page() { // TODO remove
        return this.pdfLinkService.page;
    }

    get supportsPrinting() {
        const canvas = document.createElement('canvas');
        const value = 'mozPrintCallback' in canvas;

        return pdfjsLib.shadow(this, 'supportsPrinting', value);
    }

    get supportsFullscreen() {
//#if MOZCENTRAL
      //var support = document.fullscreenEnabled === true;
      //#else
        const doc = document.documentElement;
        let support = !!(doc.requestFullscreen || doc.mozRequestFullScreen ||
                           doc.webkitRequestFullScreen || doc.msRequestFullscreen);

        if (document.fullscreenEnabled === false ||
            document.mozFullScreenEnabled === false ||
            document.webkitFullscreenEnabled === false ||
            document.msFullscreenEnabled === false)
        {
            support = false;
        }
//#endif
        if (support && pdfjsLib.PDFJS.disableFullscreen === true) {
            support = false;
        }

        return pdfjsLib.shadow(this, 'supportsFullscreen', support);
    }

    get supportsIntegratedFind() {
        return this.externalServices.supportsIntegratedFind;
    }

    get supportsDocumentFonts() {
        return this.externalServices.supportsDocumentFonts;
    }

    get supportsDocumentColors() {
        return this.externalServices.supportsDocumentColors;
    }

    get loadingBar() {
        const loadingBarElement = this.container.parentNode.querySelector('#loadingBar .progress');
        const bar = new ProgressBar(loadingBarElement, {});

        return pdfjsLib.shadow(this, 'loadingBar', bar);
    }

    get supportedMouseWheelZoomModifierKeys() {
        return this.externalServices.supportedMouseWheelZoomModifierKeys;
    }

//#if (FIREFOX || MOZCENTRAL || CHROME)
    initPassiveLoading() {
        this.externalServices.initPassiveLoading({
            onOpenWithTransport: (url, length, transport) => {
                this.open(url, {range: transport});

                if (length) {
                    this.pdfDocumentProperties.setFileSize(length);
                }
            },
            onOpenWithData: (data) => {
                this.open(data);
            },
            onOpenWithURL: (url, length, originalURL) => {
                let file = url;
                let args = null;
                if (length !== undefined) {
                    args = {length: length};
                }
                if (originalURL !== undefined) {
                    file = {file: url, originalURL: originalURL};
                }
                this.open(file, args);
            },
            onError: (e) => {
                this.error(mozL10n.get('loading_error', null, 'An error occurred while loading the PDF.'), e);
            },
            onProgress: (loaded, total) => {
                this.progress(loaded / total);
            }
        });
    }
//#endif

    setTitleUsingUrl(url) {
        this.url = url;
        try {
            this.setTitle(decodeURIComponent(
                pdfjsLib.getFilenameFromUrl(url)
            ) || url);
        } catch (e) {
        // decodeURIComponent may throw URIError,
        // fall back to using the unprocessed url in that case
            this.setTitle(url);
        }
    }

    setTitle(title) {
        if (this.isViewerEmbedded) {
            // Embedded PDF viewers should not be changing their parent page's title.
            return;
        }
        document.title = title;
    }

    /**
     * Closes opened PDF document.
     * @returns {Promise} - Returns the promise, which is resolved when all
     *                      destruction is completed.
     */
    close() {
        const errorWrapper = this.appConfig.errorWrapper.container;
        errorWrapper.setAttribute('hidden', 'true');

        if (!this.pdfLoadingTask) {
            return Promise.resolve();
        }

        const promise = this.pdfLoadingTask.destroy();
        this.pdfLoadingTask = null;

        if (this.pdfDocument) {
            this.pdfDocument = null;

            this.pdfThumbnailViewer.setDocument(null);
            this.pdfViewer.setDocument(null);
            this.pdfLinkService.setDocument(null, null);
        }
        this.store = null;
        this.isInitialViewSet = false;

        this.pdfSidebar.reset();
        this.pdfOutlineViewer.reset();
        this.pdfAttachmentViewer.reset();

        this.findController.reset();
        this.findBar.reset();

        if (typeof PDFBug !== 'undefined') {
            PDFBug.cleanup();
        }
        return promise;
    }

    /**
     * Opens PDF document specified by URL or array with additional arguments.
     * @param {string|TypedArray|ArrayBuffer} file - PDF location or binary data.
     * @param {Object} args - (optional) Additional arguments for the getDocument
     *                        call, e.g. HTTP headers ('httpHeaders') or
     *                        alternative data transport ('range').
     * @returns {Promise} - Returns the promise, which is resolved when document
     *                      is opened.
     */
    open(file, args) {
        let scale = 0;
        if (arguments.length > 2 || typeof args === 'number') {
            console.warn('Call of open() with obsolete signature.');
            if (typeof args === 'number') {
                scale = args; // scale argument was found
            }
            args = arguments[4] || null;
            if (arguments[3] && typeof arguments[3] === 'object') {
                // The pdfDataRangeTransport argument is present.
                args = Object.create(args);
                args.range = arguments[3];
            }
            if (typeof arguments[2] === 'string') {
                // The password argument is present.
                args = Object.create(args);
                args.password = arguments[2];
            }
        }

        if (this.pdfLoadingTask) {
            // We need to destroy already opened document.
            return this.close().then(() => {
                // Reload the preferences if a document was previously opened.
                Preferences.reload();
                // ... and repeat the open() call.
                return this.open(file, args);
            });
        }

        const parameters = Object.create(null);
        if (typeof file === 'string') { // URL
            this.setTitleUsingUrl(file);
            parameters.url = file;
        } else if (file && 'byteLength' in file) { // ArrayBuffer
            parameters.data = file;
        } else if (file.url && file.originalUrl) {
            this.setTitleUsingUrl(file.originalUrl);
            parameters.url = file.url;
        }
        if (args) {
            for (var prop in args) {
                parameters[prop] = args[prop];
            }
        }

        this.downloadComplete = false;

        const loadingTask = pdfjsLib.getDocument(parameters);
        this.pdfLoadingTask = loadingTask;

        loadingTask.onPassword = (updateCallback, reason) => {
            this.passwordPrompt.setUpdateCallback(updateCallback, reason);
            this.passwordPrompt.open();
        };

        loadingTask.onProgress = (progressData) => {
            this.progress(progressData.loaded / progressData.total);
        };

        // Listen for unsupported features to trigger the fallback UI.
        loadingTask.onUnsupportedFeature = this.fallback.bind(this);

        const result = loadingTask.promise.then(
            (pdfDocument) => {
                this.load(pdfDocument, scale);
            },
            (exception) => {
                var message = exception && exception.message;
                var loadingErrorMessage = mozL10n.get('loading_error', null,
                'An error occurred while loading the PDF.');

                if (exception instanceof pdfjsLib.InvalidPDFException) {
                    // change error message also for other builds
                    loadingErrorMessage = mozL10n.get('invalid_file_error', null,
                    'Invalid or corrupted PDF file.');
                } else if (exception instanceof pdfjsLib.MissingPDFException) {
                    // special message for missing PDF's
                    loadingErrorMessage = mozL10n.get('missing_file_error', null,
                    'Missing PDF file.');
                } else if (exception instanceof pdfjsLib.UnexpectedResponseException) {
                    loadingErrorMessage = mozL10n.get('unexpected_response_error', null,
                    'Unexpected server response.');
                }

                var moreInfo = {
                    message: message
                };
                this.error(loadingErrorMessage, moreInfo);

                throw new Error(loadingErrorMessage);
            }
        );

        if (args && args.length) {
            this.pdfDocumentProperties.setFileSize(args.length);
        }
        return result;
    }

    download() {
        const url = this.url.split('#')[0];
        const filename = getPDFFileNameFromURL(url);
        const downloadManager = this.downloadManager;
        downloadManager.onerror = (err) => {
            // This error won't really be helpful because it's likely the
            // fallback won't work either (or is already open).
            this.error('PDF failed to download.');
        };

        if (!this.pdfDocument) { // the PDF is not ready yet
            downloadByUrl();
            return;
        }

        if (!this.downloadComplete) { // the PDF is still downloading
            downloadByUrl();
            return;
        }

        this.pdfDocument.getData()
            .then(
                (data) => {
                    var blob = pdfjsLib.createBlob(data, 'application/pdf');
                    downloadManager.download(blob, url, filename);
                },
                downloadByUrl // Error occurred try downloading with just the url.
            )
            .then(null, downloadByUrl);

        function downloadByUrl() {
            downloadManager.downloadUrl(url, filename);
        }
    }

    fallback(featureId) {
//#if !PRODUCTION
        if (true) {
            return;
        }
//#endif
//#if (FIREFOX || MOZCENTRAL)
      // Only trigger the fallback once so we don't spam the user with messages
      // for one PDF.
        if (this.fellback) {
            return;
        }
        this.fellback = true;
        const url = this.url.split('#')[0];
        this.externalServices.fallback(
            { featureId, url },
            (download) => {
                if (!download) {
                  return;
                }
                this.download();
            }
        );
//#endif
    }

    /**
     * Show the error box.
     * @param {String} message A message that is human readable.
     * @param {Object} moreInfo (optional) Further information about the error
     *                            that is more technical.  Should have a 'message'
     *                            and optionally a 'stack' property.
     */
    error(message, moreInfo) {
        let moreInfoText = mozL10n.get('error_version_info',
                                { version: pdfjsLib.version || '?', build: pdfjsLib.build || '?'},
                                    'PDF.js v{{version}} (build: {{build}})') + '\n';
        if (moreInfo) {
            moreInfoText += mozL10n.get('error_message', { message: moreInfo.message }, 'Message: {{message}}');
            if (moreInfo.stack) {
                moreInfoText += '\n' +
                                mozL10n.get('error_stack', { stack: moreInfo.stack },
                                'Stack: {{stack}}');
            } else {
                if (moreInfo.filename) {
                    moreInfoText += '\n' +
                                    mozL10n.get('error_file', {file: moreInfo.filename},
                                    'File: {{file}}');
                }
                if (moreInfo.lineNumber) {
                    moreInfoText += '\n' +
                                    mozL10n.get('error_line', {line: moreInfo.lineNumber},
                                    'Line: {{line}}');
                }
            }
        }

//#if !(FIREFOX || MOZCENTRAL)
        const errorWrapperConfig = this.appConfig.errorWrapper;
        const errorWrapper = errorWrapperConfig.container;
        errorWrapper.removeAttribute('hidden');

        const errorMessage = errorWrapperConfig.errorMessage;
        errorMessage.textContent = message;

        const closeButton = errorWrapperConfig.closeButton;
        closeButton.onclick = () => {
            errorWrapper.setAttribute('hidden', 'true');
        };

        const errorMoreInfo = errorWrapperConfig.errorMoreInfo;
        const moreInfoButton = errorWrapperConfig.moreInfoButton;
        const lessInfoButton = errorWrapperConfig.lessInfoButton;
        moreInfoButton.onclick = () => {
            errorMoreInfo.removeAttribute('hidden');
            moreInfoButton.setAttribute('hidden', 'true');
            lessInfoButton.removeAttribute('hidden');
            errorMoreInfo.style.height = errorMoreInfo.scrollHeight + 'px';
        };
        lessInfoButton.onclick = () => {
            errorMoreInfo.setAttribute('hidden', 'true');
            moreInfoButton.removeAttribute('hidden');
            lessInfoButton.setAttribute('hidden', 'true');
        };
        moreInfoButton.oncontextmenu = noContextMenuHandler;
        lessInfoButton.oncontextmenu = noContextMenuHandler;
        closeButton.oncontextmenu = noContextMenuHandler;
        moreInfoButton.removeAttribute('hidden');
        lessInfoButton.setAttribute('hidden', 'true');
        errorMoreInfo.value = moreInfoText;
//#else
//  console.error(message + '\n' + moreInfoText);
//  this.fallback();
//#endif
    }

    progress(level) {
        const percent = Math.round(level * 100);
        // When we transition from full request to range requests, it's possible
        // that we discard some of the loaded data. This can cause the loading
        // bar to move backwards. So prevent this by only updating the bar if it
        // increases.
        if (percent > this.loadingBar.percent || isNaN(percent)) {
            this.loadingBar.percent = percent;

            // When disableAutoFetch is enabled, it's not uncommon for the entire file
            // to never be fetched (depends on e.g. the file structure). In this case
            // the loading bar will not be completely filled, nor will it be hidden.
            // To prevent displaying a partially filled loading bar permanently, we
            // hide it when no data has been loaded during a certain amount of time.
            if (pdfjsLib.PDFJS.disableAutoFetch && percent) {
                if (this.disableAutoFetchLoadingBarTimeout) {
                    clearTimeout(this.disableAutoFetchLoadingBarTimeout);
                    this.disableAutoFetchLoadingBarTimeout = null;
                }
                this.loadingBar.show();

                this.disableAutoFetchLoadingBarTimeout = setTimeout(() => {
                    this.loadingBar.hide();
                    this.disableAutoFetchLoadingBarTimeout = null;
                }, DISABLE_AUTO_FETCH_LOADING_BAR_TIMEOUT);
            }
        }
    }

    load(pdfDocument, scale) {
        scale = scale || UNKNOWN_SCALE;

        this.pdfDocument = pdfDocument;

        this.pdfDocumentProperties.setDocumentAndUrl(pdfDocument, this.url);

        var downloadedPromise = pdfDocument.getDownloadInfo().then(() => {
            this.downloadComplete = true;
            this.loadingBar.hide();
        });

        const pagesCount = pdfDocument.numPages;
        const toolbarConfig = this.appConfig.toolbar;
        toolbarConfig.numPages.textContent = mozL10n.get('page_of', { pageCount: pagesCount }, 'of {{pageCount}}');
        toolbarConfig.pageNumber.max = pagesCount;

        const id = this.documentFingerprint = pdfDocument.fingerprint;
        const store = this.store = new ViewHistory(id);

//#if GENERIC
        var baseDocumentUrl = null;
//#endif
//#if (FIREFOX || MOZCENTRAL)
//  var baseDocumentUrl = this.url.split('#')[0];
//#endif
//#if CHROME
//  var baseDocumentUrl = location.href.split('#')[0];
//#endif
        this.pdfLinkService.setDocument(pdfDocument, baseDocumentUrl);

        const pdfViewer = this.pdfViewer;
        pdfViewer.currentScale = scale;
        pdfViewer.setDocument(pdfDocument);
        const firstPagePromise = pdfViewer.firstPagePromise;
        const pagesPromise = pdfViewer.pagesPromise;

        this.pageRotation = 0;

        this.pdfThumbnailViewer.setDocument(pdfDocument);

        firstPagePromise.then((pdfPage) => {
            downloadedPromise.then(() => {
             this.eventBus.dispatch('documentload', { source: this });
        });

        this.loadingBar.setWidth(this.appConfig.viewerContainer);

        if (!pdfjsLib.PDFJS.disableHistory && !this.isViewerEmbedded) {
            // The browsing history is only enabled when the viewer is standalone,
            // i.e. not when it is embedded in a web page.
            if (!this.preferenceShowPreviousViewOnLoad) {
                this.pdfHistory.clearHistoryState();
            }
            this.pdfHistory.initialize(self.documentFingerprint);

            if (this.pdfHistory.initialDestination) {
                this.initialDestination = this.pdfHistory.initialDestination;
            } else if (this.pdfHistory.initialBookmark) {
                this.initialBookmark = this.pdfHistory.initialBookmark;
            }
        }

        const initialParams = {
            destination: self.initialDestination,
            bookmark: self.initialBookmark,
            hash: null,
        };

        store.initializedPromise.then(
            () => {
                let storedHash = null;
                let sidebarView = null;
                if (this.preferenceShowPreviousViewOnLoad && store.get('exists', false)) {
                    var pageNum = store.get('page', '1');
                    var zoom = self.preferenceDefaultZoomValue ||
                    store.get('zoom', DEFAULT_SCALE_VALUE);
                    var left = store.get('scrollLeft', '0');
                    var top = store.get('scrollTop', '0');

                    storedHash = 'page=' + pageNum + '&zoom=' + zoom + ',' +
                    left + ',' + top;

                    sidebarView = store.get('sidebarView', SidebarView.NONE);
                } else if (self.preferenceDefaultZoomValue) {
                    storedHash = 'page=1&zoom=' + self.preferenceDefaultZoomValue;
                }
                this.setInitialView(storedHash, { scale, sidebarView });

                initialParams.hash = storedHash;

                // Make all navigation keys work on document load,
                // unless the viewer is embedded in a web page.
                if (!this.isViewerEmbedded) {
                    this.pdfViewer.focus();
                }
            },
            (reason) => {
                console.error(reason);
                this.setInitialView(null, { scale });
            });

        // For documents with different page sizes,
        // ensure that the correct location becomes visible on load.
        pagesPromise.then(() => {
            if (!initialParams.destination && !initialParams.bookmark &&
                !initialParams.hash) {
                    return;
                }
                if (this.hasEqualPageSizes) {
                    return;
                }
                this.initialDestination = initialParams.destination;
                this.initialBookmark = initialParams.bookmark;

                this.pdfViewer.currentScaleValue = self.pdfViewer.currentScaleValue;
                this.setInitialView(initialParams.hash);
            });
        });

        pagesPromise.then(() => {
            if (this.supportsPrinting) {
                pdfDocument.getJavaScript()
                    .then((javaScript) => {
                        if (javaScript.length) {
                            console.warn('Warning: JavaScript is not supported');
                            self.fallback(pdfjsLib.UNSUPPORTED_FEATURES.javaScript);
                        }
                        // Hack to support auto printing.
                        const regex = /\bprint\s*\(/;
                        for (var i = 0, ii = javaScript.length; i < ii; i++) {
                            var js = javaScript[i];
                            if (js && regex.test(js)) {
                                setTimeout(function() {
                                    window.print();
                                });
                                return;
                            }
                        }
                    });
            }
        });

        // outline depends on pagesRefMap
        var promises = [pagesPromise, this.animationStartedPromise];
        Promise.all(promises).then(() => {
            pdfDocument.getOutline().then((outline) => {
                this.pdfOutlineViewer.render({ outline });
            });
            pdfDocument.getAttachments().then((attachments) => {
                this.pdfAttachmentViewer.render({ attachments });
            });
        });

        pdfDocument.getMetadata().then((data) => {
            var info = data.info, metadata = data.metadata;
            this.documentInfo = info;
            this.metadata = metadata;

            // Provides some basic debug information
            console.log('PDF ' + pdfDocument.fingerprint + ' [' +
            info.PDFFormatVersion + ' ' + (info.Producer || '-').trim() +
            ' / ' + (info.Creator || '-').trim() + ']' +
            ' (PDF.js: ' + (pdfjsLib.version || '-') +
            (!pdfjsLib.PDFJS.disableWebGL ? ' [WebGL]' : '') + ')');

            var pdfTitle;
            if (metadata && metadata.has('dc:title')) {
                var title = metadata.get('dc:title');
                // Ghostscript sometimes return 'Untitled', sets the title to 'Untitled'
                if (title !== 'Untitled') {
                    pdfTitle = title;
                }
            }

            if (!pdfTitle && info && info['Title']) {
                pdfTitle = info['Title'];
            }

            if (pdfTitle) {
                this.setTitle(pdfTitle + ' - ' + document.title);
            }

            if (info.IsAcroFormPresent) {
                console.warn('Warning: AcroForm/XFA is not supported');
                this.fallback(pdfjsLib.UNSUPPORTED_FEATURES.forms);
            }

//#if !PRODUCTION
            if (true) {
                return;
            }
//#endif
//#if (FIREFOX || MOZCENTRAL)
            var versionId = String(info.PDFFormatVersion).slice(-1) | 0;
            var generatorId = 0;
            var KNOWN_GENERATORS = [
                'acrobat distiller', 'acrobat pdfwriter', 'adobe livecycle',
                'adobe pdf library', 'adobe photoshop', 'ghostscript', 'tcpdf',
                'cairo', 'dvipdfm', 'dvips', 'pdftex', 'pdfkit', 'itext', 'prince',
                'quarkxpress', 'mac os x', 'microsoft', 'openoffice', 'oracle',
                'luradocument', 'pdf-xchange', 'antenna house', 'aspose.cells', 'fpdf'
            ];
            if (info.Producer) {
                KNOWN_GENERATORS.some(function (generator, s, i) {
                if (generator.indexOf(s) < 0) {
                    return false;
                }
                generatorId = i + 1;
                return true;
                }.bind(null, info.Producer.toLowerCase()));
            }
            var formType = !info.IsAcroFormPresent ? null : info.IsXFAPresent ? 'xfa' : 'acroform';
            this.externalServices.reportTelemetry({
                type: 'documentInfo',
                version: versionId,
                generator: generatorId,
                formType: formType
            });
//#endif
        });
    }

    setInitialView(storedHash, options) {
        const scale = options && options.scale;
        const sidebarView = options && options.sidebarView;

        this.isInitialViewSet = true;

        // When opening a new file, when one is already loaded in the viewer,
        // ensure that the 'pageNumber' element displays the correct value.
        this.appConfig.toolbar.pageNumber.value = this.pdfViewer.currentPageNumber;

        this.pdfSidebar.setInitialView(this.preferenceSidebarViewOnLoad || (sidebarView | 0));

        if (this.initialDestination) {
            this.pdfLinkService.navigateTo(this.initialDestination);
            this.initialDestination = null;
        } else if (this.initialBookmark) {
            this.pdfLinkService.setHash(this.initialBookmark);
            this.pdfHistory.push({ hash: this.initialBookmark }, true);
            this.initialBookmark = null;
        } else if (storedHash) {
            this.pdfLinkService.setHash(storedHash);
        } else if (scale) {
            this.pdfViewer.currentScaleValue = scale;
            this.page = 1;
        }

        if (!this.pdfViewer.currentScaleValue) {
            // Scale was not initialized: invalid bookmark or scale was not specified.
            // Setting the default one.
            this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
        }
    }

    cleanup() {
        if (!this.pdfDocument) {
            return; // run cleanup when document is loaded
        }
        this.pdfViewer.cleanup();
        this.pdfThumbnailViewer.cleanup();
        this.pdfDocument.cleanup();
    }

    forceRendering() {
        this.pdfRenderingQueue.printing = this.printing;
        this.pdfRenderingQueue.isThumbnailViewEnabled =
        this.pdfSidebar.isThumbnailViewVisible;
        this.pdfRenderingQueue.renderHighestPriority();
    }

    beforePrint() {
        if (!this.supportsPrinting) {
            var printMessage = mozL10n.get('printing_not_supported', null,
            'Warning: Printing is not fully supported by this browser.');
            this.error(printMessage);
            return;
        }

        var alertNotReady = false;
        var i, ii;
        if (!this.pdfDocument || !this.pagesCount) {
            alertNotReady = true;
        } else {
            for (i = 0, ii = this.pagesCount; i < ii; ++i) {
                if (!this.pdfViewer.getPageView(i).pdfPage) {
                    alertNotReady = true;
                    break;
                }
            }
        }
        if (alertNotReady) {
            var notReadyMessage = mozL10n.get('printing_not_ready', null,
            'Warning: The PDF is not fully loaded for printing.');
            window.alert(notReadyMessage);
            return;
        }

        this.printing = true;
        this.forceRendering();

        var printContainer = this.appConfig.printContainer;
        var body = document.querySelector('body');
        body.setAttribute('data-mozPrintCallback', true);

        if (!this.hasEqualPageSizes) {
            console.warn('Not all pages have the same size. The printed result ' +
            'may be incorrect!');
        }

        // Insert a @page + size rule to make sure that the page size is correctly
        // set. Note that we assume that all pages have the same size, because
        // variable-size pages are not supported yet (at least in Chrome & Firefox).
        // TODO(robwu): Use named pages when size calculation bugs get resolved
        // (e.g. https://crbug.com/355116) AND when support for named pages is
        // added (http://www.w3.org/TR/css3-page/#using-named-pages).
        // In browsers where @page + size is not supported (such as Firefox,
        // https://bugzil.la/851441), the next stylesheet will be ignored and the
        // user has to select the correct paper size in the UI if wanted.
        this.pageStyleSheet = document.createElement('style');
        var pageSize = this.pdfViewer.getPageView(0).pdfPage.getViewport(1);
        this.pageStyleSheet.textContent =
        // "size:<width> <height>" is what we need. But also add "A4" because
        // Firefox incorrectly reports support for the other value.
        '@supports ((size:A4) and (size:1pt 1pt)) {' +
        '@page { size: ' + pageSize.width + 'pt ' + pageSize.height + 'pt;}' +
        '}';
        body.appendChild(this.pageStyleSheet);

        for (i = 0, ii = this.pagesCount; i < ii; ++i) {
            this.pdfViewer.getPageView(i).beforePrint(printContainer);
        }

//#if !PRODUCTION
        if (true) {
            return;
        }
//#endif
//#if (FIREFOX || MOZCENTRAL)
        this.externalServices.reportTelemetry({
            type: 'print'
        });
//#endif
    }

    // Whether all pages of the PDF have the same width and height.
    get hasEqualPageSizes() {
        const firstPage = this.pdfViewer.getPageView(0);
        for (var i = 1, ii = this.pagesCount; i < ii; ++i) {
            var pageView = this.pdfViewer.getPageView(i);
            if (pageView.width !== firstPage.width || pageView.height !== firstPage.height) {
                return false;
            }
        }
        return true;
    }

    afterPrint() {
        const div = this.appConfig.printContainer;
        while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
        }

        if (this.pageStyleSheet && this.pageStyleSheet.parentNode) {
            this.pageStyleSheet.parentNode.removeChild(this.pageStyleSheet);
            this.pageStyleSheet = null;
        }

        this.printing = false;
        this.forceRendering();
    }

    rotatePages(delta) {
        const pageNumber = this.page;
        this.pageRotation = (this.pageRotation + 360 + delta) % 360;
        this.pdfViewer.pagesRotation = this.pageRotation;
        this.pdfThumbnailViewer.pagesRotation = this.pageRotation;

        this.forceRendering();

        this.pdfViewer.scrollPageIntoView(pageNumber);
    }

    requestPresentationMode() {
        if (!this.pdfPresentationMode) {
            return;
        }
        this.pdfPresentationMode.request();
    }

    /**
    * @param {number} delta - The delta value from the mouse event.
    */
    scrollPresentationMode(delta) {
        if (!this.pdfPresentationMode) {
            return;
        }
        this.pdfPresentationMode.mouseScroll(delta);
    }

    bindEvents() {
        const eventBus = this.eventBus;

        eventBus.on('resize', this.webViewerResize.bind(this));
        eventBus.on('localized', this.webViewerLocalized.bind(this));
        eventBus.on('hashchange', this.webViewerHashchange.bind(this));
        eventBus.on('beforeprint', this.beforePrint.bind(this));
        eventBus.on('afterprint', this.afterPrint.bind(this));
        eventBus.on('pagerendered', this.webViewerPageRendered.bind(this));
        eventBus.on('textlayerrendered', this.webViewerTextLayerRendered.bind(this));
        eventBus.on('updateviewarea', this.webViewerUpdateViewarea.bind(this));
        eventBus.on('pagechanging', this.webViewerPageChanging.bind(this));
        eventBus.on('scalechanging', this.webViewerScaleChanging.bind(this));
        eventBus.on('sidebarviewchanged', this.webViewerSidebarViewChanged.bind(this));
        eventBus.on('pagemode', this.webViewerPageMode.bind(this));
        eventBus.on('namedaction', this.webViewerNamedAction.bind(this));
        eventBus.on('presentationmodechanged', this.webViewerPresentationModeChanged.bind(this));
        eventBus.on('presentationmode', this.webViewerPresentationMode.bind(this));
        eventBus.on('openfile', this.webViewerOpenFile.bind(this));
        eventBus.on('print', this.webViewerPrint.bind(this));
        eventBus.on('download', this.webViewerDownload.bind(this));
        eventBus.on('firstpage', this.webViewerFirstPage.bind(this));
        eventBus.on('lastpage', this.webViewerLastPage.bind(this));
        eventBus.on('rotatecw', this.webViewerRotateCw.bind(this));
        eventBus.on('rotateccw', this.webViewerRotateCcw.bind(this));
        eventBus.on('documentproperties', this.webViewerDocumentProperties.bind(this));
        eventBus.on('find', this.webViewerFind.bind(this));
//#if GENERIC
        eventBus.on('fileinputchange', this.webViewerFileInputChange.bind(this));
//#endif
    }

    webViewerResize() {
        if (this.initialized) {
            const currentScaleValue = this.pdfViewer.currentScaleValue;
            if (currentScaleValue === 'auto' || currentScaleValue === 'page-fit' || currentScaleValue === 'page-width') {
                // Note: the scale is constant for 'page-actual'.
                this.pdfViewer.currentScaleValue = currentScaleValue;
            } else if (!currentScaleValue) {
                // Normally this shouldn't happen, but if the scale wasn't initialized
                // we set it to the default value in order to prevent any issues.
                // (E.g. the document being rendered with the wrong scale on load.)
                this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
            }
            this.pdfViewer.update();
        }

        // Set the 'max-height' CSS property of the secondary toolbar.
        const mainContainer = this.appConfig.mainContainer;
        this.secondaryToolbar.setMaxHeight(mainContainer);
    }

    webViewerLocalized() {
        document.getElementsByTagName('html')[0].dir = mozL10n.getDirection();

        this.animationStartedPromise.then(() => {
            // Adjust the width of the zoom box to fit the content.
            // Note: If the window is narrow enough that the zoom box is not visible,
            //       we temporarily show it to be able to adjust its width.
            const container = this.appConfig.toolbar.scaleSelectContainer;
            if (container.clientWidth === 0) {
                container.setAttribute('style', 'display: inherit;');
            }
            if (container.clientWidth > 0) {
                const select = this.appConfig.toolbar.scaleSelect;
                select.setAttribute('style', 'min-width: inherit;');
                const width = select.clientWidth + SCALE_SELECT_CONTAINER_PADDING;
                select.setAttribute('style', 'min-width: ' +
                (width + SCALE_SELECT_PADDING) + 'px;');
                container.setAttribute('style', 'min-width: ' + width + 'px; ' +
                'max-width: ' + width + 'px;');
            }

            // Set the 'max-height' CSS property of the secondary toolbar.
            const mainContainer = this.appConfig.mainContainer;
            this.secondaryToolbar.setMaxHeight(mainContainer);
        });
    }

    webViewerHashchange(e) {
        if (this.pdfHistory.isHashChangeUnlocked) {
            const hash = e.hash;
            if (!hash) {
                return;
            }
            if (!this.isInitialViewSet) {
                this.initialBookmark = hash;
            } else {
                this.pdfLinkService.setHash(hash);
            }
        }
    }

    webViewerPageRendered(e) {
        const pageNumber = e.pageNumber;
        const pageIndex = pageNumber - 1;
        const pageView = this.pdfViewer.getPageView(pageIndex);

        // Use the rendered page to set the corresponding thumbnail image.
        if (this.pdfSidebar.isThumbnailViewVisible) {
            const thumbnailView = this.pdfThumbnailViewer.
            getThumbnail(pageIndex);
            thumbnailView.setImage(pageView);
        }

        if (pdfjsLib.PDFJS.pdfBug && Stats.enabled && pageView.stats) {
            Stats.add(pageNumber, pageView.stats);
        }

        if (pageView.error) {
            this.error(mozL10n.get('rendering_error', null,
            'An error occurred while rendering the page.'), pageView.error);
        }

        // If the page is still visible when it has finished rendering,
        // ensure that the page number input loading indicator is hidden.
        if (pageNumber === this.page) {
            const pageNumberInput = this.appConfig.toolbar.pageNumber;
            pageNumberInput.classList.remove(PAGE_NUMBER_LOADING_INDICATOR);
        }

//#if !PRODUCTION
        if (true) {
            return;
        }
//#endif
//#if (FIREFOX || MOZCENTRAL)
        this.externalServices.reportTelemetry({
            type: 'pageInfo'
        });
      // It is a good time to report stream and font types.
        this.pdfDocument.getStats().then((stats) => {
            this.externalServices.reportTelemetry({
                type: 'documentStats',
                stats
            });
        });
//#endif
    }

    webViewerTextLayerRendered(e) {
        const pageIndex = e.pageNumber - 1;
        const pageView = this.pdfViewer.getPageView(pageIndex);

//#if !PRODUCTION
        if (true) {
            return;
        }
//#endif
//#if (FIREFOX || MOZCENTRAL)
        if (pageView.textLayer && pageView.textLayer.textDivs &&
            pageView.textLayer.textDivs.length > 0 &&
            !this.supportsDocumentColors) {
            console.error(mozL10n.get('document_colors_not_allowed', null,
            'PDF documents are not allowed to use their own colors: ' +
            '\'Allow pages to choose their own colors\' ' +
            'is deactivated in the browser.'));
            this.fallback();
        }
//#endif
    }

    webViewerUpdateViewarea(e) {
        if (!this.initialized) {
            return;
        }
        const location = e.location, store = this.store;

        if (store) {
            store.initializedPromise.then(() => {
                store.setMultiple({
                    'exists': true,
                    'page': location.pageNumber,
                    'zoom': location.scale,
                    'scrollLeft': location.left,
                    'scrollTop': location.top,
                }).catch(function() { /* unable to write to storage */ });
            });
        }
        const href = this.pdfLinkService.getAnchorUrl(location.pdfOpenParams);
        this.appConfig.toolbar.viewBookmark.href = href;
        this.appConfig.secondaryToolbar.viewBookmarkButton.href = href;

        // Update the current bookmark in the browsing history.
        this.pdfHistory.updateCurrentBookmark(location.pdfOpenParams, location.pageNumber);

        // Show/hide the loading indicator in the page number input element.
        const pageNumberInput = this.appConfig.toolbar.pageNumber;
        const currentPage = this.pdfViewer.getPageView(this.page - 1);

        if (currentPage.renderingState === RenderingStates.FINISHED) {
            pageNumberInput.classList.remove(PAGE_NUMBER_LOADING_INDICATOR);
        } else {
            pageNumberInput.classList.add(PAGE_NUMBER_LOADING_INDICATOR);
        }
    }

    webViewerPageChanging(e) {
        const page = e.pageNumber;
        if (e.previousPageNumber !== page) {
            this.appConfig.toolbar.pageNumber.value = page;

            if (this.pdfSidebar.isThumbnailViewVisible) {
                this.pdfThumbnailViewer.scrollThumbnailIntoView(page);
            }
        }
        const numPages = this.pagesCount;

        this.appConfig.toolbar.previous.disabled = (page <= 1);
        this.appConfig.toolbar.next.disabled = (page >= numPages);

        this.appConfig.toolbar.firstPage.disabled = (page <= 1);
        this.appConfig.toolbar.lastPage.disabled = (page >= numPages);

        // we need to update stats
        if (pdfjsLib.PDFJS.pdfBug && Stats.enabled) {
            var pageView = this.pdfViewer.getPageView(page - 1);
            if (pageView.stats) {
                Stats.add(page, pageView.stats);
            }
        }
    }

    webViewerScaleChanging(e) {
        const self = this
        const appConfig = this.appConfig;
        appConfig.toolbar.zoomOut.disabled = (e.scale === MIN_SCALE);
        appConfig.toolbar.zoomIn.disabled = (e.scale === MAX_SCALE);

        // Update the 'scaleSelect' DOM element.
        const predefinedValueFound = selectScaleOption(e.presetValue || '' + e.scale);
        if (!predefinedValueFound) {
            const customScaleOption = appConfig.toolbar.customScaleOption;
            const customScale = Math.round(e.scale * 10000) / 100;
            customScaleOption.textContent = mozL10n.get('page_scale_percent', { scale: customScale }, '{{scale}}%');
            customScaleOption.selected = true;
        }
        if (!this.initialized) {
            return;
        }
        this.pdfViewer.update();

        function selectScaleOption(value) {
          var options = self.appConfig.toolbar.scaleSelect.options;
          var predefinedValueFound = false;
          for (var i = 0, ii = options.length; i < ii; i++) {
            var option = options[i];
            if (option.value !== value) {
              option.selected = false;
              continue;
            }
            option.selected = true;
            predefinedValueFound = true;
          }
          return predefinedValueFound;
        }
    }

    webViewerSidebarViewChanged(e) {
        if (!this.initialized) {
            return;
        }
        this.pdfRenderingQueue.isThumbnailViewEnabled = this.pdfSidebar.isThumbnailViewVisible;

        const store = this.store;
        if (!store || !this.isInitialViewSet) {
            // Only update the storage when the document has been loaded *and* rendered.
            return;
        }
        store.initializedPromise.then(() => {
            store.set('sidebarView', e.view).catch(() => {});
        });
    }

    webViewerPageMode(e) {
        if (!this.initialized) {
            return;
        }
        // Handle the 'pagemode' hash parameter, see also `PDFLinkService_setHash`.
        const mode = e.mode
        let view;
        switch (mode) {
            case 'thumbs':
            view = SidebarView.THUMBS;
            break;
            case 'bookmarks':
            case 'outline':
            view = SidebarView.OUTLINE;
            break;
            case 'attachments':
            view = SidebarView.ATTACHMENTS;
            break;
            case 'none':
            view = SidebarView.NONE;
            break;
            default:
            console.error('Invalid "pagemode" hash parameter: ' + mode);
            return;
        }
        this.pdfSidebar.switchView(view, /* forceOpen = */ true);
    }

    webViewerNamedAction(e) {
        if (!this.initialized) {
            return;
        }
        // Processing couple of named actions that might be useful.
        // See also PDFLinkService.executeNamedAction
        const action = e.action;
        switch (action) {
            case 'GoToPage':
            this.appConfig.toolbar.pageNumber.focus();
            break;

            case 'Find':
            if (!this.supportsIntegratedFind) {
                this.findBar.toggle();
            }
            break;
        }
    }

    webViewerPresentationModeChanged(e) {
        const active = e.active;
        const switchInProgress = e.switchInProgress;
        this.pdfViewer.presentationModeState =
            switchInProgress ? PresentationModeState.CHANGING :
            active ? PresentationModeState.FULLSCREEN : PresentationModeState.NORMAL;
    }

    webViewerPresentationMode() {
        this.requestPresentationMode();
    }

    webViewerOpenFile() {
        const openFileInputName = this.appConfig.openFileInputName;
        document.getElementById(openFileInputName).click();
    }

    webViewerPrint() {
        window.print();
    }

    webViewerDownload() {
        this.download();
    }


    webViewerFirstPage() {
        if (this.pdfDocument) {
            this.page = 1;
        }
    }

    webViewerLastPage() {
        if (this.pdfDocument) {
            this.page = this.pagesCount;
        }
    }

    webViewerRotateCw() {
        this.rotatePages(90);
    }

    webViewerRotateCcw() {
        this.rotatePages(-90);
    }

    webViewerDocumentProperties() {
        this.pdfDocumentProperties.open();
    }

    webViewerFind(e) {
        this.findController.executeCommand('find' + e.type, {
            query: e.query,
            caseSensitive: e.caseSensitive,
            highlightAll: e.highlightAll,
            findPrevious: e.findPrevious
        });
    }

//#if GENERIC
    webViewerFileInputChange(e) {
        const file = e.fileInput.files[0];

        if (!pdfjsLib.PDFJS.disableCreateObjectURL && typeof URL !== 'undefined' && URL.createObjectURL) {
            this.open(URL.createObjectURL(file));
        } else {
            // Read the local file into a Uint8Array.
            const fileReader = new FileReader();
            fileReader.onload = (evt) => {
                var buffer = evt.target.result;
                var uint8Array = new Uint8Array(buffer);
                this.open(uint8Array);
            };
            fileReader.readAsArrayBuffer(file);
        }

        this.setTitleUsingUrl(file.name);

        // URL does not reflect proper document location - hiding some icons.
        const appConfig = this.appConfig;
        appConfig.toolbar.viewBookmark.setAttribute('hidden', 'true');
        appConfig.secondaryToolbar.viewBookmarkButton.setAttribute('hidden', 'true');
        appConfig.toolbar.download.setAttribute('hidden', 'true');
        appConfig.secondaryToolbar.downloadButton.setAttribute('hidden', 'true');
    }
//#endif


    webViewerInitialized() {
//#if GENERIC
        const queryString = document.location.search.substring(1);
        const params = parseQueryString(queryString);
        const file = 'file' in params ? params.file : DEFAULT_URL;
        validateFileURL(file);
//#endif
//#if (FIREFOX || MOZCENTRAL)
//var file = window.location.href.split('#')[0];
//#endif
//#if CHROME
//var file = DEFAULT_URL;
//#endif

        const waitForBeforeOpening = [];
        const appConfig = this.appConfig;
        //#if GENERIC
        const fileInput = document.createElement('input');
        fileInput.id = appConfig.openFileInputName;
        fileInput.className = 'fileInput';
        fileInput.setAttribute('type', 'file');
        fileInput.oncontextmenu = noContextMenuHandler;
        document.body.appendChild(fileInput);

        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            appConfig.toolbar.openFile.setAttribute('hidden', 'true');
            appConfig.secondaryToolbar.openFileButton.setAttribute('hidden', 'true');
        } else {
            fileInput.value = null;
        }

//#else
//appConfig.toolbar.openFile.setAttribute('hidden', 'true');
//appConfig.secondaryToolbar.openFileButton.setAttribute('hidden', 'true');
//#endif

        const PDFJS = pdfjsLib.PDFJS;

        //#if !PRODUCTION
        if (true) {
//#else
//if (this.preferencePdfBugEnabled) {
//#endif
            // Special debugging flags in the hash section of the URL.
            const hash = document.location.hash.substring(1);
            const hashParams = parseQueryString(hash);

            if ('disableworker' in hashParams) {
                PDFJS.disableWorker = (hashParams['disableworker'] === 'true');
            }
            if ('disablerange' in hashParams) {
                PDFJS.disableRange = (hashParams['disablerange'] === 'true');
            }
            if ('disablestream' in hashParams) {
                PDFJS.disableStream = (hashParams['disablestream'] === 'true');
            }
            if ('disableautofetch' in hashParams) {
                PDFJS.disableAutoFetch = (hashParams['disableautofetch'] === 'true');
            }
            if ('disablefontface' in hashParams) {
                PDFJS.disableFontFace = (hashParams['disablefontface'] === 'true');
            }
            if ('disablehistory' in hashParams) {
                PDFJS.disableHistory = (hashParams['disablehistory'] === 'true');
            }
            if ('webgl' in hashParams) {
                PDFJS.disableWebGL = (hashParams['webgl'] !== 'true');
            }
            if ('useonlycsszoom' in hashParams) {
                PDFJS.useOnlyCssZoom = (hashParams['useonlycsszoom'] === 'true');
            }
            if ('verbosity' in hashParams) {
                PDFJS.verbosity = hashParams['verbosity'] | 0;
            }
            if ('ignorecurrentpositiononzoom' in hashParams) {
                PDFJS.ignoreCurrentPositionOnZoom =
                (hashParams['ignorecurrentpositiononzoom'] === 'true');
            }
//#if !PRODUCTION
            if ('disablebcmaps' in hashParams && hashParams['disablebcmaps']) {
                PDFJS.cMapUrl = '../external/cmaps/';
                PDFJS.cMapPacked = false;
            }
//#endif
//#if !(FIREFOX || MOZCENTRAL)
            if ('locale' in hashParams) {
                PDFJS.locale = hashParams['locale'];
            }
//#endif
            if ('textlayer' in hashParams) {
                switch (hashParams['textlayer']) {
                    case 'off':
                    PDFJS.disableTextLayer = true;
                    break;
                    case 'visible':
                    case 'shadow':
                    case 'hover':
                    var viewer = appConfig.viewerContainer;
                    viewer.classList.add('textLayer-' + hashParams['textlayer']);
                    break;
                }
            }
            if ('pdfbug' in hashParams) {
                PDFJS.pdfBug = true;
                var pdfBug = hashParams['pdfbug'];
                var enabled = pdfBug.split(',');
                waitForBeforeOpening.push(loadAndEnablePDFBug(enabled).bind(this));
            }
        }

//#if !(FIREFOX || MOZCENTRAL)
        mozL10n.setLanguage(PDFJS.locale);
//#endif
//#if (FIREFOX || MOZCENTRAL)
        if (!this.supportsDocumentFonts) {
            PDFJS.disableFontFace = true;
            console.warn(mozL10n.get('web_fonts_disabled', null,
            'Web fonts are disabled: unable to use embedded PDF fonts.'));
        }
//#endif

        if (!this.supportsPrinting) {
            appConfig.toolbar.print.classList.add('hidden');
            appConfig.secondaryToolbar.printButton.classList.add('hidden');
        }

        if (!this.supportsFullscreen) {
            appConfig.toolbar.presentationModeButton.classList.add('hidden');
            appConfig.secondaryToolbar.presentationModeButton.classList.add('hidden');
        }

        if (this.supportsIntegratedFind) {
            appConfig.toolbar.viewFind.classList.add('hidden');
        }

        // Suppress context menus for some controls
        appConfig.toolbar.scaleSelect.oncontextmenu = noContextMenuHandler;

        appConfig.sidebar.mainContainer.addEventListener('transitionend', (e) => {
            if (e.target === /* mainContainer */ this) {
                this.eventBus.dispatch('resize');
            }
        }, true);

        appConfig.sidebar.toggleButton.addEventListener('click', () => {
            this.pdfSidebar.toggle();
        });

        appConfig.toolbar.previous.addEventListener('click', () => {
            this.page--;
        });

        appConfig.toolbar.next.addEventListener('click', () => {
            this.page++;
        });

        appConfig.toolbar.zoomIn.addEventListener('click', () => {
            this.zoomIn();
        });

        appConfig.toolbar.zoomOut.addEventListener('click', () => {
            this.zoomOut();
        });

        appConfig.toolbar.pageNumber.addEventListener('click', function() {
            this.select();
        });

        appConfig.toolbar.pageNumber.addEventListener('change', () => {
            // Handle the user inputting a floating point number.
            this.page = (this.value | 0);

            if (this.value !== (this.value | 0).toString()) {
                this.value = this.page;
            }
        });

        appConfig.toolbar.scaleSelect.addEventListener('change', () => {
            if (this.value === 'custom') {
                return;
            }
            this.pdfViewer.currentScaleValue = this.value;
        });

        appConfig.toolbar.presentationModeButton.addEventListener('click', (e) => {
            this.eventBus.dispatch('presentationmode');
        });

        appConfig.toolbar.openFile.addEventListener('click', (e) => {
            this.eventBus.dispatch('openfile');
        });

        appConfig.toolbar.print.addEventListener('click', (e) => {
            this.eventBus.dispatch('print');
        });

        appConfig.toolbar.download.addEventListener('click', (e) => {
            this.eventBus.dispatch('download');
        });

        Promise.all(waitForBeforeOpening).then(() => {
            this.webViewerOpenFileViaURL(file);
        }).catch((reason) => {
            this.error(mozL10n.get('loading_error', null,
            'An error occurred while opening.'), reason);
        });
    }

//#if GENERIC
    webViewerOpenFileViaURL(file) {
        if (file && file.lastIndexOf('file:', 0) === 0) {
            // file:-scheme. Load the contents in the main thread because QtWebKit
            // cannot load file:-URLs in a Web Worker. file:-URLs are usually loaded
            // very quickly, so there is no need to set up progress event listeners.
            this.setTitleUsingUrl(file);
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                this.open(new Uint8Array(xhr.response));
            };
            try {
                xhr.open('GET', file);
                xhr.responseType = 'arraybuffer';
                xhr.send();
            } catch (e) {
                this.error(mozL10n.get('loading_error', null,
                'An error occurred while loading the PDF.'), e);
            }
            return;
        }

        if (file) {
            this.open(file);
        }
    }
//#elif (FIREFOX || MOZCENTRAL || CHROME)
//webViewerOpenFileViaURL(file) {
//  this.setTitleUsingUrl(file);
//  this.initPassiveLoading();
//}
//#else
//webViewerOpenFileViaURL(file) {
//  if (file) {
//    throw new Error('Not implemented: webViewerOpenFileURL');
//  }
//}
//#endif



    addEventListeners () {
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('hashchange', this.onHashChange.bind(this));
//#if GENERIC
        window.addEventListener('change', this.onChange.bind(this), true);
//#endif
        window.addEventListener('beforeprint', this.beforePrint.bind(this));
        window.addEventListener('afterprint', this.afterPrint.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('localized', this.localized.bind(this));
        window.addEventListener('DOMMouseScroll', this.handleMouseWheel.bind(this));
        window.addEventListener('mousewheel', this.handleMouseWheel.bind(this));
        window.addEventListener('click', this.onClick.bind(this), true);
    }


    onResize(evt) {
      this.eventBus.dispatch('resize');
    }

    onHashChange(evt) {
      var hash = document.location.hash.substring(1);
      this.eventBus.dispatch('hashchange', {hash: hash});
    }

//#if GENERIC
    onChange(evt) {
      var files = evt.target.files;
      if (!files || files.length === 0) {
        return;
      }
      this.eventBus.dispatch('fileinputchange',
        {fileInput: evt.target});
    }
//#endif

    localized(evt) {
      this.eventBus.dispatch('localized');
    }

    handleMouseWheel(evt) {
      var MOUSE_WHEEL_DELTA_FACTOR = 40;
      var ticks = (evt.type === 'DOMMouseScroll') ? -evt.detail :
                  evt.wheelDelta / MOUSE_WHEEL_DELTA_FACTOR;
      var direction = (ticks < 0) ? 'zoomOut' : 'zoomIn';

      var pdfViewer = this.pdfViewer;
      if (pdfViewer.isInPresentationMode) {
        evt.preventDefault();
        this.scrollPresentationMode(ticks *
                                                    MOUSE_WHEEL_DELTA_FACTOR);
      } else if (evt.ctrlKey || evt.metaKey) {
        var support = this.supportedMouseWheelZoomModifierKeys;
        if ((evt.ctrlKey && !support.ctrlKey) ||
            (evt.metaKey && !support.metaKey)) {
          return;
        }
        // Only zoom the pages, not the entire viewer.
        evt.preventDefault();
        // NOTE: this check must be placed *after* preventDefault.
        if (this.zoomDisabled) {
          return;
        }

        var previousScale = pdfViewer.currentScale;

        this[direction](Math.abs(ticks));

        var currentScale = pdfViewer.currentScale;
        if (previousScale !== currentScale) {
          // After scaling the page via zoomIn/zoomOut, the position of the upper-
          // left corner is restored. When the mouse wheel is used, the position
          // under the cursor should be restored instead.
          var scaleCorrectionFactor = currentScale / previousScale - 1;
          var rect = pdfViewer.container.getBoundingClientRect();
          var dx = evt.clientX - rect.left;
          var dy = evt.clientY - rect.top;
          pdfViewer.container.scrollLeft += dx * scaleCorrectionFactor;
          pdfViewer.container.scrollTop += dy * scaleCorrectionFactor;
        }
      } else {
        this.zoomDisabled = true;
        clearTimeout(this.zoomDisabledTimeout);
        this.zoomDisabledTimeout = setTimeout(function () {
          this.zoomDisabled = false;
        }, 1000);
      }
    }

    onClick(evt) {
      if (!this.secondaryToolbar.isOpen) {
        return;
      }
      var appConfig = this.appConfig;
      if (this.pdfViewer.containsElement(evt.target) ||
          (appConfig.toolbar.container.contains(evt.target) &&
           evt.target !== appConfig.secondaryToolbar.toggleButton)) {
        this.secondaryToolbar.close();
      }
    }

    onKeyDown(evt) {
      if (this.overlayManager.active) {
        return;
      }

      var handled = false;
      var cmd = (evt.ctrlKey ? 1 : 0) |
                (evt.altKey ? 2 : 0) |
                (evt.shiftKey ? 4 : 0) |
                (evt.metaKey ? 8 : 0);

      var pdfViewer = this.pdfViewer;
      var isViewerInPresentationMode = pdfViewer && pdfViewer.isInPresentationMode;

      // First, handle the key bindings that are independent whether an input
      // control is selected or not.
      if (cmd === 1 || cmd === 8 || cmd === 5 || cmd === 12) {
        // either CTRL or META key with optional SHIFT.
        switch (evt.keyCode) {
          case 70: // f
            if (!this.supportsIntegratedFind) {
              this.findBar.open();
              handled = true;
            }
            break;
          case 71: // g
            if (!this.supportsIntegratedFind) {
              var findState = this.findController.state;
              if (findState) {
                this.findController.executeCommand('findagain', {
                  query: findState.query,
                  caseSensitive: findState.caseSensitive,
                  highlightAll: findState.highlightAll,
                  findPrevious: cmd === 5 || cmd === 12
                });
              }
              handled = true;
            }
            break;
          case 61: // FF/Mac '='
          case 107: // FF '+' and '='
          case 187: // Chrome '+'
          case 171: // FF with German keyboard
            if (!isViewerInPresentationMode) {
              this.zoomIn();
            }
            handled = true;
            break;
          case 173: // FF/Mac '-'
          case 109: // FF '-'
          case 189: // Chrome '-'
            if (!isViewerInPresentationMode) {
              this.zoomOut();
            }
            handled = true;
            break;
          case 48: // '0'
          case 96: // '0' on Numpad of Swedish keyboard
            if (!isViewerInPresentationMode) {
              // keeping it unhandled (to restore page zoom to 100%)
              setTimeout(function () {
                // ... and resetting the scale after browser adjusts its scale
                pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
              });
              handled = false;
            }
            break;
        }
      }

//#if !(FIREFOX || MOZCENTRAL)
      // CTRL or META without shift
      if (cmd === 1 || cmd === 8) {
        switch (evt.keyCode) {
          case 83: // s
            this.download();
            handled = true;
            break;
        }
      }
//#endif

      // CTRL+ALT or Option+Command
      if (cmd === 3 || cmd === 10) {
        switch (evt.keyCode) {
          case 80: // p
            this.requestPresentationMode();
            handled = true;
            break;
          case 71: // g
            // focuses input#pageNumber field
            this.appConfig.toolbar.pageNumber.select();
            handled = true;
            break;
        }
      }

      if (handled) {
        evt.preventDefault();
        return;
      }

      // Some shortcuts should not get handled if a control/input element
      // is selected.
      var curElement = document.activeElement || document.querySelector(':focus');
      var curElementTagName = curElement && curElement.tagName.toUpperCase();
      if (curElementTagName === 'INPUT' ||
          curElementTagName === 'TEXTAREA' ||
          curElementTagName === 'SELECT') {
        // Make sure that the secondary toolbar is closed when Escape is pressed.
        if (evt.keyCode !== 27) { // 'Esc'
          return;
        }
      }
      var ensureViewerFocused = false;

      if (cmd === 0) { // no control key pressed at all.
        switch (evt.keyCode) {
          case 38: // up arrow
          case 33: // pg up
          case 8: // backspace
            if (!isViewerInPresentationMode &&
                pdfViewer.currentScaleValue !== 'page-fit') {
              break;
            }
            /* in presentation mode */
            /* falls through */
          case 37: // left arrow
            // horizontal scrolling using arrow keys
            if (pdfViewer.isHorizontalScrollbarEnabled) {
              break;
            }
            /* falls through */
          case 75: // 'k'
          case 80: // 'p'
            this.page--;
            handled = true;
            break;
          case 27: // esc key
            if (this.secondaryToolbar.isOpen) {
              this.secondaryToolbar.close();
              handled = true;
            }
            if (!this.supportsIntegratedFind &&
                this.findBar.opened) {
              this.findBar.close();
              handled = true;
            }
            break;
          case 40: // down arrow
          case 34: // pg down
          case 32: // spacebar
            if (!isViewerInPresentationMode &&
                pdfViewer.currentScaleValue !== 'page-fit') {
              break;
            }
            /* falls through */
          case 39: // right arrow
            // horizontal scrolling using arrow keys
            if (pdfViewer.isHorizontalScrollbarEnabled) {
              break;
            }
            /* falls through */
          case 74: // 'j'
          case 78: // 'n'
            this.page++;
            handled = true;
            break;

          case 36: // home
            if (isViewerInPresentationMode || this.page > 1) {
              this.page = 1;
              handled = true;
              ensureViewerFocused = true;
            }
            break;
          case 35: // end
            if (isViewerInPresentationMode || (this.pdfDocument &&
                this.page < this.pagesCount)) {
              this.page = this.pagesCount;
              handled = true;
              ensureViewerFocused = true;
            }
            break;

          case 72: // 'h'
            if (!isViewerInPresentationMode) {
              this.handTool.toggle();
            }
            break;
          case 82: // 'r'
            this.rotatePages(90);
            break;
        }
      }

      if (cmd === 4) { // shift-key
        switch (evt.keyCode) {
          case 32: // spacebar
            if (!isViewerInPresentationMode &&
                pdfViewer.currentScaleValue !== 'page-fit') {
              break;
            }
            this.page--;
            handled = true;
            break;

          case 82: // 'r'
            this.rotatePages(-90);
            break;
        }
      }

      if (!handled && !isViewerInPresentationMode) {
        // 33=Page Up  34=Page Down  35=End    36=Home
        // 37=Left     38=Up         39=Right  40=Down
        // 32=Spacebar
        if ((evt.keyCode >= 33 && evt.keyCode <= 40) ||
            (evt.keyCode === 32 && curElementTagName !== 'BUTTON')) {
          ensureViewerFocused = true;
        }
      }

      if (cmd === 2) { // alt-key
        switch (evt.keyCode) {
          case 37: // left arrow
            if (isViewerInPresentationMode) {
              this.pdfHistory.back();
              handled = true;
            }
            break;
          case 39: // right arrow
            if (isViewerInPresentationMode) {
              this.pdfHistory.forward();
              handled = true;
            }
            break;
        }
      }

      if (ensureViewerFocused && !pdfViewer.containsElement(curElement)) {
        // The page container is not focused, but a page navigation key has been
        // pressed. Change the focus to the viewer container to make sure that
        // navigation by keyboard works as expected.
        pdfViewer.focus();
      }

      if (handled) {
        evt.preventDefault();
      }
    }

    beforePrint(evt) {
      this.eventBus.dispatch('beforeprint');
    }

    afterPrint(evt) {
      this.eventBus.dispatch('afterprint');
    }
}



//#if GENERIC
var HOSTED_VIEWER_ORIGINS = ['null',
  'http://mozilla.github.io', 'https://mozilla.github.io'];
function validateFileURL(file) {
  try {
    var viewerOrigin = new URL(window.location.href).origin || 'null';
    if (HOSTED_VIEWER_ORIGINS.indexOf(viewerOrigin) >= 0) {
      // Hosted or local viewer, allow for any file locations
      return;
    }
    var fileOrigin = new URL(file, window.location.href).origin;
    // Removing of the following line will not guarantee that the viewer will
    // start accepting URLs from foreign origin -- CORS headers on the remote
    // server must be properly configured.
    if (fileOrigin !== viewerOrigin) {
      throw new Error('file origin does not match viewer\'s');
    }
  } catch (e) {
    var message = e && e.message;
    var loadingErrorMessage = mozL10n.get('loading_error', null,
      'An error occurred while loading the PDF.');

    var moreInfo = {
      message: message
    };
    this.error(loadingErrorMessage, moreInfo);
    throw e;
  }
}
//#endif

function loadAndEnablePDFBug(enabledTabs) {
  return new Promise((resolve, reject) => {
    var appConfig = this.appConfig;
    var script = document.createElement('script');
    script.src = appConfig.debuggerScriptPath;
    script.onload = function () {
      PDFBug.enable(enabledTabs);
      PDFBug.init(pdfjsLib, appConfig.mainContainer);
      resolve();
    };
    script.onerror = function () {
      reject(new Error('Cannot load debugger at ' + script.src));
    };
    (document.getElementsByTagName('head')[0] || document.body).
      appendChild(script);
  });
}



exports.PDFViewerApplication = PDFViewerApplication;
exports.DefaultExernalServices = DefaultExernalServices;
}));
