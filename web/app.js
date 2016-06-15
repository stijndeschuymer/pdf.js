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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

    var UNKNOWN_SCALE = uiUtilsLib.UNKNOWN_SCALE;
    var DEFAULT_SCALE_VALUE = uiUtilsLib.DEFAULT_SCALE_VALUE;
    var ProgressBar = uiUtilsLib.ProgressBar;
    var getPDFFileNameFromURL = uiUtilsLib.getPDFFileNameFromURL;
    var noContextMenuHandler = uiUtilsLib.noContextMenuHandler;
    var mozL10n = uiUtilsLib.mozL10n;
    var parseQueryString = uiUtilsLib.parseQueryString;
    var PDFHistory = pdfHistoryLib.PDFHistory;
    var Preferences = preferencesLib.Preferences;
    var SidebarView = pdfSidebarLib.SidebarView;
    var PDFSidebar = pdfSidebarLib.PDFSidebar;
    var ViewHistory = viewHistoryLib.ViewHistory;
    var PDFThumbnailViewer = pdfThumbnailViewerLib.PDFThumbnailViewer;
    var SecondaryToolbar = secondaryToolbarLib.SecondaryToolbar;
    var PasswordPrompt = passwordPromptLib.PasswordPrompt;
    var PDFPresentationMode = pdfPresentationModeLib.PDFPresentationMode;
    var PDFDocumentProperties = pdfDocumentPropertiesLib.PDFDocumentProperties;
    var HandTool = handToolLib.HandTool;
    var PresentationModeState = pdfViewerLib.PresentationModeState;
    var PDFViewer = pdfViewerLib.PDFViewer;
    var RenderingStates = pdfRenderingQueueLib.RenderingStates;
    var PDFRenderingQueue = pdfRenderingQueueLib.PDFRenderingQueue;
    var PDFLinkService = pdfLinkServiceLib.PDFLinkService;
    var PDFOutlineViewer = pdfOutlineViewerLib.PDFOutlineViewer;
    var OverlayManager = overlayManagerLib.OverlayManager;
    var PDFAttachmentViewer = pdfAttachmentViewerLib.PDFAttachmentViewer;
    var PDFFindController = pdfFindControllerLib.PDFFindController;
    var PDFFindBar = pdfFindBarLib.PDFFindBar;
    var getGlobalEventBus = domEventsLib.getGlobalEventBus;
    var EventBus = uiUtilsLib.EventBus;

    var DEFAULT_SCALE_DELTA = 1.1;
    var MIN_SCALE = 0.25;
    var MAX_SCALE = 10.0;
    var SCALE_SELECT_CONTAINER_PADDING = 8;
    var SCALE_SELECT_PADDING = 22;
    var PAGE_NUMBER_LOADING_INDICATOR = 'visiblePageIsLoading';
    var DISABLE_AUTO_FETCH_LOADING_BAR_TIMEOUT = 5000;

    var DefaultExernalServices = {
        updateFindControlState: function updateFindControlState(data) {},
        initPassiveLoading: function initPassiveLoading(callbacks) {},
        fallback: function fallback(data, callback) {},
        reportTelemetry: function reportTelemetry(data) {},
        createDownloadManager: function createDownloadManager() {
            return new downloadManagerLib.DownloadManager();
        },
        supportsIntegratedFind: false,
        supportsDocumentFonts: true,
        supportsDocumentColors: true,
        supportedMouseWheelZoomModifierKeys: {
            ctrlKey: true,
            metaKey: true
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

    var PDFViewerApplication = function () {
        function PDFViewerApplication() {
            _classCallCheck(this, PDFViewerApplication);

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
            this.animationStartedPromise = new Promise(function (resolve) {
                window.requestAnimationFrame(resolve);
            });
            this.preferenceSidebarViewOnLoad = SidebarView.NONE;
            this.preferencePdfBugEnabled = false;
            this.preferenceShowPreviousViewOnLoad = true;
            this.preferenceDefaultZoomValue = '';
            this.zoomDisabled = false;
            this.zoomDisabledTimeout = null;
            this.isViewerEmbedded = window.parent !== window;
            this.url = '';
            this.externalServices = DefaultExernalServices;
        }

        _createClass(PDFViewerApplication, [{
            key: 'initialize',
            value: function initialize(appConfig) {
                var _this = this;

                //configure(pdfjsLib.PDFJS);
                this.appConfig = appConfig;

                var eventBus = appConfig.eventBus ? getGlobalEventBus() : new EventBus();
                this.eventBus = eventBus;
                this.bindEvents();
                this.addEventListeners();

                var pdfRenderingQueue = new PDFRenderingQueue();
                pdfRenderingQueue.onIdle = this.cleanup.bind(this);
                this.pdfRenderingQueue = pdfRenderingQueue;

                var pdfLinkService = new PDFLinkService({
                    eventBus: eventBus
                });
                this.pdfLinkService = pdfLinkService;

                var downloadManager = this.externalServices.createDownloadManager();
                this.downloadManager = downloadManager;

                var container = appConfig.mainContainer;
                this.container = container;
                var viewer = appConfig.viewerContainer;
                var innerContainer = appConfig.innerContainer;
                this.pdfViewer = new PDFViewer({
                    container: container,
                    innerContainer: innerContainer,
                    viewer: viewer,
                    eventBus: eventBus,
                    renderingQueue: pdfRenderingQueue,
                    linkService: pdfLinkService,
                    downloadManager: downloadManager
                });
                pdfRenderingQueue.setViewer(this.pdfViewer);
                pdfLinkService.setViewer(this.pdfViewer);

                var thumbnailContainer = appConfig.sidebar.thumbnailView;
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
                this.findController.onUpdateResultsCount = function (matchCount) {
                    if (_this.supportsIntegratedFind) {
                        return;
                    }
                    _this.findBar.updateResultsCount(matchCount);
                };
                this.findController.onUpdateState = function (state, previous, matchCount) {
                    if (_this.supportsIntegratedFind) {
                        _this.externalServices.updateFindControlState({ result: state, findPrevious: previous });
                    } else {
                        _this.findBar.updateUIState(state, previous, matchCount);
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
                    eventBus: this.eventBus
                });

                this.pdfDocumentProperties = new PDFDocumentProperties(appConfig.documentProperties);

                this.secondaryToolbar = new SecondaryToolbar(appConfig.secondaryToolbar, eventBus);

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
                    linkService: pdfLinkService
                });

                this.pdfAttachmentViewer = new PDFAttachmentViewer({
                    container: appConfig.sidebar.attachmentsView,
                    eventBus: this.eventBus,
                    downloadManager: downloadManager
                });

                // FIXME better PDFSidebar constructor parameters
                var sidebarConfig = Object.create(appConfig.sidebar);
                sidebarConfig.pdfViewer = this.pdfViewer;
                sidebarConfig.pdfThumbnailViewer = this.pdfThumbnailViewer;
                sidebarConfig.pdfOutlineViewer = this.pdfOutlineViewer;
                sidebarConfig.eventBus = this.eventBus;
                this.pdfSidebar = new PDFSidebar(sidebarConfig);
                this.pdfSidebar.onToggled = this.forceRendering.bind(this);

                var PDFJS = pdfjsLib.PDFJS;
                var initializedPromise = Promise.all([Preferences.get('enableWebGL').then(function (value) {
                    PDFJS.disableWebGL = !value;
                }), Preferences.get('sidebarViewOnLoad').then(function (value) {
                    _this.preferenceSidebarViewOnLoad = value;
                }), Preferences.get('pdfBugEnabled').then(function (value) {
                    _this.preferencePdfBugEnabled = value;
                }), Preferences.get('showPreviousViewOnLoad').then(function (value) {
                    _this.preferenceShowPreviousViewOnLoad = value;
                }), Preferences.get('defaultZoomValue').then(function (value) {
                    _this.preferenceDefaultZoomValue = value;
                }), Preferences.get('disableTextLayer').then(function (value) {
                    if (PDFJS.disableTextLayer === true) {
                        return;
                    }
                    PDFJS.disableTextLayer = value;
                }), Preferences.get('disableRange').then(function (value) {
                    if (PDFJS.disableRange === true) {
                        return;
                    }
                    PDFJS.disableRange = value;
                }), Preferences.get('disableStream').then(function (value) {
                    if (PDFJS.disableStream === true) {
                        return;
                    }
                    PDFJS.disableStream = value;
                }), Preferences.get('disableAutoFetch').then(function (value) {
                    PDFJS.disableAutoFetch = value;
                }), Preferences.get('disableFontFace').then(function (value) {
                    if (PDFJS.disableFontFace === true) {
                        return;
                    }
                    PDFJS.disableFontFace = value;
                }), Preferences.get('useOnlyCssZoom').then(function (value) {
                    PDFJS.useOnlyCssZoom = value;
                }), Preferences.get('externalLinkTarget').then(function (value) {
                    if (PDFJS.isExternalLinkTargetSet()) {
                        return;
                    }
                    PDFJS.externalLinkTarget = value;
                })]).
                // TODO move more preferences and other async stuff here
                catch(function (reason) {});

                return initializedPromise.then(function () {
                    if (_this.isViewerEmbedded && !PDFJS.isExternalLinkTargetSet()) {
                        // Prevent external links from "replacing" the viewer,
                        // when it's embedded in e.g. an iframe or an object.
                        PDFJS.externalLinkTarget = PDFJS.LinkTarget.TOP;
                    }

                    _this.initialized = true;
                });
            }
        }, {
            key: 'run',
            value: function run(config) {
                this.initialize(config).then(this.webViewerInitialized.bind(this));
            }
        }, {
            key: 'zoomIn',
            value: function zoomIn(ticks) {
                var newScale = this.pdfViewer.currentScale;
                do {
                    newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
                    newScale = Math.ceil(newScale * 10) / 10;
                    newScale = Math.min(MAX_SCALE, newScale);
                } while (--ticks > 0 && newScale < MAX_SCALE);
                this.pdfViewer.currentScaleValue = newScale;
            }
        }, {
            key: 'zoomOut',
            value: function zoomOut(ticks) {
                var newScale = this.pdfViewer.currentScale;
                do {
                    newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
                    newScale = Math.floor(newScale * 10) / 10;
                    newScale = Math.max(MIN_SCALE, newScale);
                } while (--ticks > 0 && newScale > MIN_SCALE);
                this.pdfViewer.currentScaleValue = newScale;
            }
        }, {
            key: 'initPassiveLoading',


            //#if (FIREFOX || MOZCENTRAL || CHROME)
            value: function initPassiveLoading() {
                var _this2 = this;

                this.externalServices.initPassiveLoading({
                    onOpenWithTransport: function onOpenWithTransport(url, length, transport) {
                        _this2.open(url, { range: transport });

                        if (length) {
                            _this2.pdfDocumentProperties.setFileSize(length);
                        }
                    },
                    onOpenWithData: function onOpenWithData(data) {
                        _this2.open(data);
                    },
                    onOpenWithURL: function onOpenWithURL(url, length, originalURL) {
                        var file = url;
                        var args = null;
                        if (length !== undefined) {
                            args = { length: length };
                        }
                        if (originalURL !== undefined) {
                            file = { file: url, originalURL: originalURL };
                        }
                        _this2.open(file, args);
                    },
                    onError: function onError(e) {
                        _this2.error(mozL10n.get('loading_error', null, 'An error occurred while loading the PDF.'), e);
                    },
                    onProgress: function onProgress(loaded, total) {
                        _this2.progress(loaded / total);
                    }
                });
            }
            //#endif

        }, {
            key: 'setTitleUsingUrl',
            value: function setTitleUsingUrl(url) {
                this.url = url;
                try {
                    this.setTitle(decodeURIComponent(pdfjsLib.getFilenameFromUrl(url)) || url);
                } catch (e) {
                    // decodeURIComponent may throw URIError,
                    // fall back to using the unprocessed url in that case
                    this.setTitle(url);
                }
            }
        }, {
            key: 'setTitle',
            value: function setTitle(title) {
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

        }, {
            key: 'close',
            value: function close() {
                var errorWrapper = this.appConfig.errorWrapper.container;
                errorWrapper.setAttribute('hidden', 'true');

                if (!this.pdfLoadingTask) {
                    return Promise.resolve();
                }

                var promise = this.pdfLoadingTask.destroy();
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

        }, {
            key: 'open',
            value: function open(file, args) {
                var _this3 = this;

                var scale = 0;
                if (arguments.length > 2 || typeof args === 'number') {
                    console.warn('Call of open() with obsolete signature.');
                    if (typeof args === 'number') {
                        scale = args; // scale argument was found
                    }
                    args = arguments[4] || null;
                    if (arguments[3] && _typeof(arguments[3]) === 'object') {
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
                    return this.close().then(function () {
                        // Reload the preferences if a document was previously opened.
                        Preferences.reload();
                        // ... and repeat the open() call.
                        return _this3.open(file, args);
                    });
                }

                var parameters = Object.create(null);
                if (typeof file === 'string') {
                    // URL
                    this.setTitleUsingUrl(file);
                    parameters.url = file;
                } else if (file && 'byteLength' in file) {
                    // ArrayBuffer
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

                var loadingTask = pdfjsLib.getDocument(parameters);
                this.pdfLoadingTask = loadingTask;

                loadingTask.onPassword = function (updateCallback, reason) {
                    _this3.passwordPrompt.setUpdateCallback(updateCallback, reason);
                    _this3.passwordPrompt.open();
                };

                loadingTask.onProgress = function (progressData) {
                    _this3.progress(progressData.loaded / progressData.total);
                };

                // Listen for unsupported features to trigger the fallback UI.
                loadingTask.onUnsupportedFeature = this.fallback.bind(this);

                var result = loadingTask.promise.then(function (pdfDocument) {
                    _this3.load(pdfDocument, scale);
                }, function (exception) {
                    var message = exception && exception.message;
                    var loadingErrorMessage = mozL10n.get('loading_error', null, 'An error occurred while loading the PDF.');

                    if (exception instanceof pdfjsLib.InvalidPDFException) {
                        // change error message also for other builds
                        loadingErrorMessage = mozL10n.get('invalid_file_error', null, 'Invalid or corrupted PDF file.');
                    } else if (exception instanceof pdfjsLib.MissingPDFException) {
                        // special message for missing PDF's
                        loadingErrorMessage = mozL10n.get('missing_file_error', null, 'Missing PDF file.');
                    } else if (exception instanceof pdfjsLib.UnexpectedResponseException) {
                        loadingErrorMessage = mozL10n.get('unexpected_response_error', null, 'Unexpected server response.');
                    }

                    var moreInfo = {
                        message: message
                    };
                    _this3.error(loadingErrorMessage, moreInfo);

                    throw new Error(loadingErrorMessage);
                });

                if (args && args.length) {
                    this.pdfDocumentProperties.setFileSize(args.length);
                }
                return result;
            }
        }, {
            key: 'download',
            value: function download() {
                var _this4 = this;

                var url = this.url.split('#')[0];
                var filename = getPDFFileNameFromURL(url);
                var downloadManager = this.downloadManager;
                downloadManager.onerror = function (err) {
                    // This error won't really be helpful because it's likely the
                    // fallback won't work either (or is already open).
                    _this4.error('PDF failed to download.');
                };

                if (!this.pdfDocument) {
                    // the PDF is not ready yet
                    downloadByUrl();
                    return;
                }

                if (!this.downloadComplete) {
                    // the PDF is still downloading
                    downloadByUrl();
                    return;
                }

                this.pdfDocument.getData().then(function (data) {
                    var blob = pdfjsLib.createBlob(data, 'application/pdf');
                    downloadManager.download(blob, url, filename);
                }, downloadByUrl // Error occurred try downloading with just the url.
                ).then(null, downloadByUrl);

                function downloadByUrl() {
                    downloadManager.downloadUrl(url, filename);
                }
            }
        }, {
            key: 'fallback',
            value: function fallback(featureId) {
                var _this5 = this;

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
                var url = this.url.split('#')[0];
                this.externalServices.fallback({ featureId: featureId, url: url }, function (download) {
                    if (!download) {
                        return;
                    }
                    _this5.download();
                });
                //#endif
            }

            /**
             * Show the error box.
             * @param {String} message A message that is human readable.
             * @param {Object} moreInfo (optional) Further information about the error
             *                            that is more technical.  Should have a 'message'
             *                            and optionally a 'stack' property.
             */

        }, {
            key: 'error',
            value: function error(message, moreInfo) {
                var moreInfoText = mozL10n.get('error_version_info', { version: pdfjsLib.version || '?', build: pdfjsLib.build || '?' }, 'PDF.js v{{version}} (build: {{build}})') + '\n';
                if (moreInfo) {
                    moreInfoText += mozL10n.get('error_message', { message: moreInfo.message }, 'Message: {{message}}');
                    if (moreInfo.stack) {
                        moreInfoText += '\n' + mozL10n.get('error_stack', { stack: moreInfo.stack }, 'Stack: {{stack}}');
                    } else {
                        if (moreInfo.filename) {
                            moreInfoText += '\n' + mozL10n.get('error_file', { file: moreInfo.filename }, 'File: {{file}}');
                        }
                        if (moreInfo.lineNumber) {
                            moreInfoText += '\n' + mozL10n.get('error_line', { line: moreInfo.lineNumber }, 'Line: {{line}}');
                        }
                    }
                }

                //#if !(FIREFOX || MOZCENTRAL)
                var errorWrapperConfig = this.appConfig.errorWrapper;
                var errorWrapper = errorWrapperConfig.container;
                errorWrapper.removeAttribute('hidden');

                var errorMessage = errorWrapperConfig.errorMessage;
                errorMessage.textContent = message;

                var closeButton = errorWrapperConfig.closeButton;
                closeButton.onclick = function () {
                    errorWrapper.setAttribute('hidden', 'true');
                };

                var errorMoreInfo = errorWrapperConfig.errorMoreInfo;
                var moreInfoButton = errorWrapperConfig.moreInfoButton;
                var lessInfoButton = errorWrapperConfig.lessInfoButton;
                moreInfoButton.onclick = function () {
                    errorMoreInfo.removeAttribute('hidden');
                    moreInfoButton.setAttribute('hidden', 'true');
                    lessInfoButton.removeAttribute('hidden');
                    errorMoreInfo.style.height = errorMoreInfo.scrollHeight + 'px';
                };
                lessInfoButton.onclick = function () {
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
        }, {
            key: 'progress',
            value: function progress(level) {
                var _this6 = this;

                var percent = Math.round(level * 100);
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

                        this.disableAutoFetchLoadingBarTimeout = setTimeout(function () {
                            _this6.loadingBar.hide();
                            _this6.disableAutoFetchLoadingBarTimeout = null;
                        }, DISABLE_AUTO_FETCH_LOADING_BAR_TIMEOUT);
                    }
                }
            }
        }, {
            key: 'load',
            value: function load(pdfDocument, scale) {
                var _this7 = this;

                scale = scale || UNKNOWN_SCALE;

                this.pdfDocument = pdfDocument;

                this.pdfDocumentProperties.setDocumentAndUrl(pdfDocument, this.url);

                var downloadedPromise = pdfDocument.getDownloadInfo().then(function () {
                    _this7.downloadComplete = true;
                    _this7.loadingBar.hide();
                });

                var pagesCount = pdfDocument.numPages;
                var toolbarConfig = this.appConfig.toolbar;
                toolbarConfig.numPages.textContent = mozL10n.get('page_of', { pageCount: pagesCount }, 'of {{pageCount}}');
                toolbarConfig.pageNumber.max = pagesCount;

                var id = this.documentFingerprint = pdfDocument.fingerprint;
                var store = this.store = new ViewHistory(id);

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

                var pdfViewer = this.pdfViewer;
                pdfViewer.currentScale = scale;
                pdfViewer.setDocument(pdfDocument);
                var firstPagePromise = pdfViewer.firstPagePromise;
                var pagesPromise = pdfViewer.pagesPromise;

                this.pageRotation = 0;

                this.pdfThumbnailViewer.setDocument(pdfDocument);

                firstPagePromise.then(function (pdfPage) {
                    downloadedPromise.then(function () {
                        _this7.eventBus.dispatch('documentload', { source: _this7 });
                    });

                    _this7.loadingBar.setWidth(_this7.appConfig.viewerContainer);

                    if (!pdfjsLib.PDFJS.disableHistory && !_this7.isViewerEmbedded) {
                        // The browsing history is only enabled when the viewer is standalone,
                        // i.e. not when it is embedded in a web page.
                        if (!_this7.preferenceShowPreviousViewOnLoad) {
                            _this7.pdfHistory.clearHistoryState();
                        }
                        _this7.pdfHistory.initialize(self.documentFingerprint);

                        if (_this7.pdfHistory.initialDestination) {
                            _this7.initialDestination = _this7.pdfHistory.initialDestination;
                        } else if (_this7.pdfHistory.initialBookmark) {
                            _this7.initialBookmark = _this7.pdfHistory.initialBookmark;
                        }
                    }

                    var initialParams = {
                        destination: self.initialDestination,
                        bookmark: self.initialBookmark,
                        hash: null
                    };

                    store.initializedPromise.then(function () {
                        var storedHash = null;
                        var sidebarView = null;
                        if (_this7.preferenceShowPreviousViewOnLoad && store.get('exists', false)) {
                            var pageNum = store.get('page', '1');
                            var zoom = self.preferenceDefaultZoomValue || store.get('zoom', DEFAULT_SCALE_VALUE);
                            var left = store.get('scrollLeft', '0');
                            var top = store.get('scrollTop', '0');

                            storedHash = 'page=' + pageNum + '&zoom=' + zoom + ',' + left + ',' + top;

                            sidebarView = store.get('sidebarView', SidebarView.NONE);
                        } else if (self.preferenceDefaultZoomValue) {
                            storedHash = 'page=1&zoom=' + self.preferenceDefaultZoomValue;
                        }
                        _this7.setInitialView(storedHash, { scale: scale, sidebarView: sidebarView });

                        initialParams.hash = storedHash;

                        // Make all navigation keys work on document load,
                        // unless the viewer is embedded in a web page.
                        if (!_this7.isViewerEmbedded) {
                            _this7.pdfViewer.focus();
                        }
                    }, function (reason) {
                        console.error(reason);
                        _this7.setInitialView(null, { scale: scale });
                    });

                    // For documents with different page sizes,
                    // ensure that the correct location becomes visible on load.
                    pagesPromise.then(function () {
                        if (!initialParams.destination && !initialParams.bookmark && !initialParams.hash) {
                            return;
                        }
                        if (_this7.hasEqualPageSizes) {
                            return;
                        }
                        _this7.initialDestination = initialParams.destination;
                        _this7.initialBookmark = initialParams.bookmark;

                        _this7.pdfViewer.currentScaleValue = self.pdfViewer.currentScaleValue;
                        _this7.setInitialView(initialParams.hash);
                    });
                });

                pagesPromise.then(function () {
                    if (_this7.supportsPrinting) {
                        pdfDocument.getJavaScript().then(function (javaScript) {
                            if (javaScript.length) {
                                console.warn('Warning: JavaScript is not supported');
                                self.fallback(pdfjsLib.UNSUPPORTED_FEATURES.javaScript);
                            }
                            // Hack to support auto printing.
                            var regex = /\bprint\s*\(/;
                            for (var i = 0, ii = javaScript.length; i < ii; i++) {
                                var js = javaScript[i];
                                if (js && regex.test(js)) {
                                    setTimeout(function () {
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
                Promise.all(promises).then(function () {
                    pdfDocument.getOutline().then(function (outline) {
                        _this7.pdfOutlineViewer.render({ outline: outline });
                    });
                    pdfDocument.getAttachments().then(function (attachments) {
                        _this7.pdfAttachmentViewer.render({ attachments: attachments });
                    });
                });

                pdfDocument.getMetadata().then(function (data) {
                    var info = data.info,
                        metadata = data.metadata;
                    _this7.documentInfo = info;
                    _this7.metadata = metadata;

                    // Provides some basic debug information
                    console.log('PDF ' + pdfDocument.fingerprint + ' [' + info.PDFFormatVersion + ' ' + (info.Producer || '-').trim() + ' / ' + (info.Creator || '-').trim() + ']' + ' (PDF.js: ' + (pdfjsLib.version || '-') + (!pdfjsLib.PDFJS.disableWebGL ? ' [WebGL]' : '') + ')');

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
                        _this7.setTitle(pdfTitle + ' - ' + document.title);
                    }

                    if (info.IsAcroFormPresent) {
                        console.warn('Warning: AcroForm/XFA is not supported');
                        _this7.fallback(pdfjsLib.UNSUPPORTED_FEATURES.forms);
                    }

                    //#if !PRODUCTION
                    if (true) {
                        return;
                    }
                    //#endif
                    //#if (FIREFOX || MOZCENTRAL)
                    var versionId = String(info.PDFFormatVersion).slice(-1) | 0;
                    var generatorId = 0;
                    var KNOWN_GENERATORS = ['acrobat distiller', 'acrobat pdfwriter', 'adobe livecycle', 'adobe pdf library', 'adobe photoshop', 'ghostscript', 'tcpdf', 'cairo', 'dvipdfm', 'dvips', 'pdftex', 'pdfkit', 'itext', 'prince', 'quarkxpress', 'mac os x', 'microsoft', 'openoffice', 'oracle', 'luradocument', 'pdf-xchange', 'antenna house', 'aspose.cells', 'fpdf'];
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
                    _this7.externalServices.reportTelemetry({
                        type: 'documentInfo',
                        version: versionId,
                        generator: generatorId,
                        formType: formType
                    });
                    //#endif
                });
            }
        }, {
            key: 'setInitialView',
            value: function setInitialView(storedHash, options) {
                var scale = options && options.scale;
                var sidebarView = options && options.sidebarView;

                this.isInitialViewSet = true;

                // When opening a new file, when one is already loaded in the viewer,
                // ensure that the 'pageNumber' element displays the correct value.
                this.appConfig.toolbar.pageNumber.value = this.pdfViewer.currentPageNumber;

                this.pdfSidebar.setInitialView(this.preferenceSidebarViewOnLoad || sidebarView | 0);

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
        }, {
            key: 'cleanup',
            value: function cleanup() {
                if (!this.pdfDocument) {
                    return; // run cleanup when document is loaded
                }
                this.pdfViewer.cleanup();
                this.pdfThumbnailViewer.cleanup();
                this.pdfDocument.cleanup();
            }
        }, {
            key: 'forceRendering',
            value: function forceRendering() {
                this.pdfRenderingQueue.printing = this.printing;
                this.pdfRenderingQueue.isThumbnailViewEnabled = this.pdfSidebar.isThumbnailViewVisible;
                this.pdfRenderingQueue.renderHighestPriority();
            }
        }, {
            key: 'beforePrint',
            value: function beforePrint() {
                if (!this.supportsPrinting) {
                    var printMessage = mozL10n.get('printing_not_supported', null, 'Warning: Printing is not fully supported by this browser.');
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
                    var notReadyMessage = mozL10n.get('printing_not_ready', null, 'Warning: The PDF is not fully loaded for printing.');
                    window.alert(notReadyMessage);
                    return;
                }

                this.printing = true;
                this.forceRendering();

                var printContainer = this.appConfig.printContainer;
                var body = document.querySelector('body');
                body.setAttribute('data-mozPrintCallback', true);

                if (!this.hasEqualPageSizes) {
                    console.warn('Not all pages have the same size. The printed result ' + 'may be incorrect!');
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
                '@supports ((size:A4) and (size:1pt 1pt)) {' + '@page { size: ' + pageSize.width + 'pt ' + pageSize.height + 'pt;}' + '}';
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

        }, {
            key: 'afterPrint',
            value: function afterPrint() {
                var div = this.appConfig.printContainer;
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
        }, {
            key: 'rotatePages',
            value: function rotatePages(delta) {
                var pageNumber = this.page;
                this.pageRotation = (this.pageRotation + 360 + delta) % 360;
                this.pdfViewer.pagesRotation = this.pageRotation;
                this.pdfThumbnailViewer.pagesRotation = this.pageRotation;

                this.forceRendering();

                this.pdfViewer.scrollPageIntoView(pageNumber);
            }
        }, {
            key: 'requestPresentationMode',
            value: function requestPresentationMode() {
                if (!this.pdfPresentationMode) {
                    return;
                }
                this.pdfPresentationMode.request();
            }

            /**
            * @param {number} delta - The delta value from the mouse event.
            */

        }, {
            key: 'scrollPresentationMode',
            value: function scrollPresentationMode(delta) {
                if (!this.pdfPresentationMode) {
                    return;
                }
                this.pdfPresentationMode.mouseScroll(delta);
            }
        }, {
            key: 'bindEvents',
            value: function bindEvents() {
                var eventBus = this.eventBus;

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
        }, {
            key: 'webViewerResize',
            value: function webViewerResize() {
                if (this.initialized) {
                    var currentScaleValue = this.pdfViewer.currentScaleValue;
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
                var mainContainer = this.appConfig.mainContainer;
                this.secondaryToolbar.setMaxHeight(mainContainer);
            }
        }, {
            key: 'webViewerLocalized',
            value: function webViewerLocalized() {
                var _this8 = this;

                document.getElementsByTagName('html')[0].dir = mozL10n.getDirection();

                this.animationStartedPromise.then(function () {
                    // Adjust the width of the zoom box to fit the content.
                    // Note: If the window is narrow enough that the zoom box is not visible,
                    //       we temporarily show it to be able to adjust its width.
                    var container = _this8.appConfig.toolbar.scaleSelectContainer;
                    if (container.clientWidth === 0) {
                        container.setAttribute('style', 'display: inherit;');
                    }
                    if (container.clientWidth > 0) {
                        var select = _this8.appConfig.toolbar.scaleSelect;
                        select.setAttribute('style', 'min-width: inherit;');
                        var width = select.clientWidth + SCALE_SELECT_CONTAINER_PADDING;
                        select.setAttribute('style', 'min-width: ' + (width + SCALE_SELECT_PADDING) + 'px;');
                        container.setAttribute('style', 'min-width: ' + width + 'px; ' + 'max-width: ' + width + 'px;');
                    }

                    // Set the 'max-height' CSS property of the secondary toolbar.
                    var mainContainer = _this8.appConfig.mainContainer;
                    _this8.secondaryToolbar.setMaxHeight(mainContainer);
                });
            }
        }, {
            key: 'webViewerHashchange',
            value: function webViewerHashchange(e) {
                if (this.pdfHistory.isHashChangeUnlocked) {
                    var hash = e.hash;
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
        }, {
            key: 'webViewerPageRendered',
            value: function webViewerPageRendered(e) {
                var _this9 = this;

                var pageNumber = e.pageNumber;
                var pageIndex = pageNumber - 1;
                var pageView = this.pdfViewer.getPageView(pageIndex);

                // Use the rendered page to set the corresponding thumbnail image.
                if (this.pdfSidebar.isThumbnailViewVisible) {
                    var thumbnailView = this.pdfThumbnailViewer.getThumbnail(pageIndex);
                    thumbnailView.setImage(pageView);
                }

                if (pdfjsLib.PDFJS.pdfBug && Stats.enabled && pageView.stats) {
                    Stats.add(pageNumber, pageView.stats);
                }

                if (pageView.error) {
                    this.error(mozL10n.get('rendering_error', null, 'An error occurred while rendering the page.'), pageView.error);
                }

                // If the page is still visible when it has finished rendering,
                // ensure that the page number input loading indicator is hidden.
                if (pageNumber === this.page) {
                    var pageNumberInput = this.appConfig.toolbar.pageNumber;
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
                this.pdfDocument.getStats().then(function (stats) {
                    _this9.externalServices.reportTelemetry({
                        type: 'documentStats',
                        stats: stats
                    });
                });
                //#endif
            }
        }, {
            key: 'webViewerTextLayerRendered',
            value: function webViewerTextLayerRendered(e) {
                var pageIndex = e.pageNumber - 1;
                var pageView = this.pdfViewer.getPageView(pageIndex);

                //#if !PRODUCTION
                if (true) {
                    return;
                }
                //#endif
                //#if (FIREFOX || MOZCENTRAL)
                if (pageView.textLayer && pageView.textLayer.textDivs && pageView.textLayer.textDivs.length > 0 && !this.supportsDocumentColors) {
                    console.error(mozL10n.get('document_colors_not_allowed', null, 'PDF documents are not allowed to use their own colors: ' + '\'Allow pages to choose their own colors\' ' + 'is deactivated in the browser.'));
                    this.fallback();
                }
                //#endif
            }
        }, {
            key: 'webViewerUpdateViewarea',
            value: function webViewerUpdateViewarea(e) {
                if (!this.initialized) {
                    return;
                }
                var location = e.location,
                    store = this.store;

                if (store) {
                    store.initializedPromise.then(function () {
                        store.setMultiple({
                            'exists': true,
                            'page': location.pageNumber,
                            'zoom': location.scale,
                            'scrollLeft': location.left,
                            'scrollTop': location.top
                        }).catch(function () {/* unable to write to storage */});
                    });
                }
                var href = this.pdfLinkService.getAnchorUrl(location.pdfOpenParams);
                this.appConfig.toolbar.viewBookmark.href = href;
                this.appConfig.secondaryToolbar.viewBookmarkButton.href = href;

                // Update the current bookmark in the browsing history.
                this.pdfHistory.updateCurrentBookmark(location.pdfOpenParams, location.pageNumber);

                // Show/hide the loading indicator in the page number input element.
                var pageNumberInput = this.appConfig.toolbar.pageNumber;
                var currentPage = this.pdfViewer.getPageView(this.page - 1);

                if (currentPage.renderingState === RenderingStates.FINISHED) {
                    pageNumberInput.classList.remove(PAGE_NUMBER_LOADING_INDICATOR);
                } else {
                    pageNumberInput.classList.add(PAGE_NUMBER_LOADING_INDICATOR);
                }
            }
        }, {
            key: 'webViewerPageChanging',
            value: function webViewerPageChanging(e) {
                var page = e.pageNumber;
                if (e.previousPageNumber !== page) {
                    this.appConfig.toolbar.pageNumber.value = page;

                    if (this.pdfSidebar.isThumbnailViewVisible) {
                        this.pdfThumbnailViewer.scrollThumbnailIntoView(page);
                    }
                }
                var numPages = this.pagesCount;

                this.appConfig.toolbar.previous.disabled = page <= 1;
                this.appConfig.toolbar.next.disabled = page >= numPages;

                this.appConfig.toolbar.firstPage.disabled = page <= 1;
                this.appConfig.toolbar.lastPage.disabled = page >= numPages;

                // we need to update stats
                if (pdfjsLib.PDFJS.pdfBug && Stats.enabled) {
                    var pageView = this.pdfViewer.getPageView(page - 1);
                    if (pageView.stats) {
                        Stats.add(page, pageView.stats);
                    }
                }
            }
        }, {
            key: 'webViewerScaleChanging',
            value: function webViewerScaleChanging(e) {
                var self = this;
                var appConfig = this.appConfig;
                appConfig.toolbar.zoomOut.disabled = e.scale === MIN_SCALE;
                appConfig.toolbar.zoomIn.disabled = e.scale === MAX_SCALE;

                // Update the 'scaleSelect' DOM element.
                var predefinedValueFound = selectScaleOption(e.presetValue || '' + e.scale);
                if (!predefinedValueFound) {
                    var customScaleOption = appConfig.toolbar.customScaleOption;
                    var customScale = Math.round(e.scale * 10000) / 100;
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
        }, {
            key: 'webViewerSidebarViewChanged',
            value: function webViewerSidebarViewChanged(e) {
                if (!this.initialized) {
                    return;
                }
                this.pdfRenderingQueue.isThumbnailViewEnabled = this.pdfSidebar.isThumbnailViewVisible;

                var store = this.store;
                if (!store || !this.isInitialViewSet) {
                    // Only update the storage when the document has been loaded *and* rendered.
                    return;
                }
                store.initializedPromise.then(function () {
                    store.set('sidebarView', e.view).catch(function () {});
                });
            }
        }, {
            key: 'webViewerPageMode',
            value: function webViewerPageMode(e) {
                if (!this.initialized) {
                    return;
                }
                // Handle the 'pagemode' hash parameter, see also `PDFLinkService_setHash`.
                var mode = e.mode;
                var view = void 0;
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
                this.pdfSidebar.switchView(view, /* forceOpen = */true);
            }
        }, {
            key: 'webViewerNamedAction',
            value: function webViewerNamedAction(e) {
                if (!this.initialized) {
                    return;
                }
                // Processing couple of named actions that might be useful.
                // See also PDFLinkService.executeNamedAction
                var action = e.action;
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
        }, {
            key: 'webViewerPresentationModeChanged',
            value: function webViewerPresentationModeChanged(e) {
                var active = e.active;
                var switchInProgress = e.switchInProgress;
                this.pdfViewer.presentationModeState = switchInProgress ? PresentationModeState.CHANGING : active ? PresentationModeState.FULLSCREEN : PresentationModeState.NORMAL;
            }
        }, {
            key: 'webViewerPresentationMode',
            value: function webViewerPresentationMode() {
                this.requestPresentationMode();
            }
        }, {
            key: 'webViewerOpenFile',
            value: function webViewerOpenFile() {
                var openFileInputName = this.appConfig.openFileInputName;
                document.getElementById(openFileInputName).click();
            }
        }, {
            key: 'webViewerPrint',
            value: function webViewerPrint() {
                window.print();
            }
        }, {
            key: 'webViewerDownload',
            value: function webViewerDownload() {
                this.download();
            }
        }, {
            key: 'webViewerFirstPage',
            value: function webViewerFirstPage() {
                if (this.pdfDocument) {
                    this.page = 1;
                }
            }
        }, {
            key: 'webViewerLastPage',
            value: function webViewerLastPage() {
                if (this.pdfDocument) {
                    this.page = this.pagesCount;
                }
            }
        }, {
            key: 'webViewerRotateCw',
            value: function webViewerRotateCw() {
                this.rotatePages(90);
            }
        }, {
            key: 'webViewerRotateCcw',
            value: function webViewerRotateCcw() {
                this.rotatePages(-90);
            }
        }, {
            key: 'webViewerDocumentProperties',
            value: function webViewerDocumentProperties() {
                this.pdfDocumentProperties.open();
            }
        }, {
            key: 'webViewerFind',
            value: function webViewerFind(e) {
                this.findController.executeCommand('find' + e.type, {
                    query: e.query,
                    caseSensitive: e.caseSensitive,
                    highlightAll: e.highlightAll,
                    findPrevious: e.findPrevious
                });
            }

            //#if GENERIC

        }, {
            key: 'webViewerFileInputChange',
            value: function webViewerFileInputChange(e) {
                var _this10 = this;

                var file = e.fileInput.files[0];

                if (!pdfjsLib.PDFJS.disableCreateObjectURL && typeof URL !== 'undefined' && URL.createObjectURL) {
                    this.open(URL.createObjectURL(file));
                } else {
                    // Read the local file into a Uint8Array.
                    var fileReader = new FileReader();
                    fileReader.onload = function (evt) {
                        var buffer = evt.target.result;
                        var uint8Array = new Uint8Array(buffer);
                        _this10.open(uint8Array);
                    };
                    fileReader.readAsArrayBuffer(file);
                }

                this.setTitleUsingUrl(file.name);

                // URL does not reflect proper document location - hiding some icons.
                var appConfig = this.appConfig;
                appConfig.toolbar.viewBookmark.setAttribute('hidden', 'true');
                appConfig.secondaryToolbar.viewBookmarkButton.setAttribute('hidden', 'true');
                appConfig.toolbar.download.setAttribute('hidden', 'true');
                appConfig.secondaryToolbar.downloadButton.setAttribute('hidden', 'true');
            }
            //#endif

        }, {
            key: 'webViewerInitialized',
            value: function webViewerInitialized() {
                var /* mainContainer */_this11 = this;

                //#if GENERIC
                var queryString = document.location.search.substring(1);
                var params = parseQueryString(queryString);
                var file = 'file' in params ? params.file : DEFAULT_URL;
                validateFileURL(file);
                //#endif
                //#if (FIREFOX || MOZCENTRAL)
                //var file = window.location.href.split('#')[0];
                //#endif
                //#if CHROME
                //var file = DEFAULT_URL;
                //#endif

                var waitForBeforeOpening = [];
                var appConfig = this.appConfig;
                //#if GENERIC
                var fileInput = document.createElement('input');
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

                var PDFJS = pdfjsLib.PDFJS;

                //#if !PRODUCTION
                if (true) {
                    //#else
                    //if (this.preferencePdfBugEnabled) {
                    //#endif
                    // Special debugging flags in the hash section of the URL.
                    var hash = document.location.hash.substring(1);
                    var hashParams = parseQueryString(hash);

                    if ('disableworker' in hashParams) {
                        PDFJS.disableWorker = hashParams['disableworker'] === 'true';
                    }
                    if ('disablerange' in hashParams) {
                        PDFJS.disableRange = hashParams['disablerange'] === 'true';
                    }
                    if ('disablestream' in hashParams) {
                        PDFJS.disableStream = hashParams['disablestream'] === 'true';
                    }
                    if ('disableautofetch' in hashParams) {
                        PDFJS.disableAutoFetch = hashParams['disableautofetch'] === 'true';
                    }
                    if ('disablefontface' in hashParams) {
                        PDFJS.disableFontFace = hashParams['disablefontface'] === 'true';
                    }
                    if ('disablehistory' in hashParams) {
                        PDFJS.disableHistory = hashParams['disablehistory'] === 'true';
                    }
                    if ('webgl' in hashParams) {
                        PDFJS.disableWebGL = hashParams['webgl'] !== 'true';
                    }
                    if ('useonlycsszoom' in hashParams) {
                        PDFJS.useOnlyCssZoom = hashParams['useonlycsszoom'] === 'true';
                    }
                    if ('verbosity' in hashParams) {
                        PDFJS.verbosity = hashParams['verbosity'] | 0;
                    }
                    if ('ignorecurrentpositiononzoom' in hashParams) {
                        PDFJS.ignoreCurrentPositionOnZoom = hashParams['ignorecurrentpositiononzoom'] === 'true';
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
                    console.warn(mozL10n.get('web_fonts_disabled', null, 'Web fonts are disabled: unable to use embedded PDF fonts.'));
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

                appConfig.sidebar.mainContainer.addEventListener('transitionend', function (e) {
                    if (e.target === _this11) {
                        _this11.eventBus.dispatch('resize');
                    }
                }, true);

                appConfig.sidebar.toggleButton.addEventListener('click', function () {
                    _this11.pdfSidebar.toggle();
                });

                appConfig.toolbar.previous.addEventListener('click', function () {
                    _this11.page--;
                });

                appConfig.toolbar.next.addEventListener('click', function () {
                    _this11.page++;
                });

                appConfig.toolbar.zoomIn.addEventListener('click', function () {
                    _this11.zoomIn();
                });

                appConfig.toolbar.zoomOut.addEventListener('click', function () {
                    _this11.zoomOut();
                });

                appConfig.toolbar.pageNumber.addEventListener('click', function () {
                    this.select();
                });

                appConfig.toolbar.pageNumber.addEventListener('change', function () {
                    // Handle the user inputting a floating point number.
                    _this11.page = _this11.value | 0;

                    if (_this11.value !== (_this11.value | 0).toString()) {
                        _this11.value = _this11.page;
                    }
                });

                appConfig.toolbar.scaleSelect.addEventListener('change', function () {
                    if (_this11.value === 'custom') {
                        return;
                    }
                    _this11.pdfViewer.currentScaleValue = _this11.value;
                });

                appConfig.toolbar.presentationModeButton.addEventListener('click', function (e) {
                    _this11.eventBus.dispatch('presentationmode');
                });

                appConfig.toolbar.openFile.addEventListener('click', function (e) {
                    _this11.eventBus.dispatch('openfile');
                });

                appConfig.toolbar.print.addEventListener('click', function (e) {
                    _this11.eventBus.dispatch('print');
                });

                appConfig.toolbar.download.addEventListener('click', function (e) {
                    _this11.eventBus.dispatch('download');
                });

                Promise.all(waitForBeforeOpening).then(function () {
                    _this11.webViewerOpenFileViaURL(file);
                }).catch(function (reason) {
                    _this11.error(mozL10n.get('loading_error', null, 'An error occurred while opening.'), reason);
                });
            }

            //#if GENERIC

        }, {
            key: 'webViewerOpenFileViaURL',
            value: function webViewerOpenFileViaURL(file) {
                var _this12 = this;

                if (file && file.lastIndexOf('file:', 0) === 0) {
                    var _ret = function () {
                        // file:-scheme. Load the contents in the main thread because QtWebKit
                        // cannot load file:-URLs in a Web Worker. file:-URLs are usually loaded
                        // very quickly, so there is no need to set up progress event listeners.
                        _this12.setTitleUsingUrl(file);
                        var xhr = new XMLHttpRequest();
                        xhr.onload = function () {
                            _this12.open(new Uint8Array(xhr.response));
                        };
                        try {
                            xhr.open('GET', file);
                            xhr.responseType = 'arraybuffer';
                            xhr.send();
                        } catch (e) {
                            _this12.error(mozL10n.get('loading_error', null, 'An error occurred while loading the PDF.'), e);
                        }
                        return {
                            v: void 0
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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

        }, {
            key: 'addEventListeners',
            value: function addEventListeners() {
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
        }, {
            key: 'onResize',
            value: function onResize(evt) {
                this.eventBus.dispatch('resize');
            }
        }, {
            key: 'onHashChange',
            value: function onHashChange(evt) {
                var hash = document.location.hash.substring(1);
                this.eventBus.dispatch('hashchange', { hash: hash });
            }

            //#if GENERIC

        }, {
            key: 'onChange',
            value: function onChange(evt) {
                var files = evt.target.files;
                if (!files || files.length === 0) {
                    return;
                }
                this.eventBus.dispatch('fileinputchange', { fileInput: evt.target });
            }
            //#endif

        }, {
            key: 'localized',
            value: function localized(evt) {
                this.eventBus.dispatch('localized');
            }
        }, {
            key: 'handleMouseWheel',
            value: function handleMouseWheel(evt) {
                var MOUSE_WHEEL_DELTA_FACTOR = 40;
                var ticks = evt.type === 'DOMMouseScroll' ? -evt.detail : evt.wheelDelta / MOUSE_WHEEL_DELTA_FACTOR;
                var direction = ticks < 0 ? 'zoomOut' : 'zoomIn';

                var pdfViewer = this.pdfViewer;
                if (pdfViewer.isInPresentationMode) {
                    evt.preventDefault();
                    this.scrollPresentationMode(ticks * MOUSE_WHEEL_DELTA_FACTOR);
                } else if (evt.ctrlKey || evt.metaKey) {
                    var support = this.supportedMouseWheelZoomModifierKeys;
                    if (evt.ctrlKey && !support.ctrlKey || evt.metaKey && !support.metaKey) {
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
        }, {
            key: 'onClick',
            value: function onClick(evt) {
                if (!this.secondaryToolbar.isOpen) {
                    return;
                }
                var appConfig = this.appConfig;
                if (this.pdfViewer.containsElement(evt.target) || appConfig.toolbar.container.contains(evt.target) && evt.target !== appConfig.secondaryToolbar.toggleButton) {
                    this.secondaryToolbar.close();
                }
            }
        }, {
            key: 'onKeyDown',
            value: function onKeyDown(evt) {
                if (this.overlayManager.active) {
                    return;
                }

                var handled = false;
                var cmd = (evt.ctrlKey ? 1 : 0) | (evt.altKey ? 2 : 0) | (evt.shiftKey ? 4 : 0) | (evt.metaKey ? 8 : 0);

                var pdfViewer = this.pdfViewer;
                var isViewerInPresentationMode = pdfViewer && pdfViewer.isInPresentationMode;

                // First, handle the key bindings that are independent whether an input
                // control is selected or not.
                if (cmd === 1 || cmd === 8 || cmd === 5 || cmd === 12) {
                    // either CTRL or META key with optional SHIFT.
                    switch (evt.keyCode) {
                        case 70:
                            // f
                            if (!this.supportsIntegratedFind) {
                                this.findBar.open();
                                handled = true;
                            }
                            break;
                        case 71:
                            // g
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
                        case 171:
                            // FF with German keyboard
                            if (!isViewerInPresentationMode) {
                                this.zoomIn();
                            }
                            handled = true;
                            break;
                        case 173: // FF/Mac '-'
                        case 109: // FF '-'
                        case 189:
                            // Chrome '-'
                            if (!isViewerInPresentationMode) {
                                this.zoomOut();
                            }
                            handled = true;
                            break;
                        case 48: // '0'
                        case 96:
                            // '0' on Numpad of Swedish keyboard
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
                        case 83:
                            // s
                            this.download();
                            handled = true;
                            break;
                    }
                }
                //#endif

                // CTRL+ALT or Option+Command
                if (cmd === 3 || cmd === 10) {
                    switch (evt.keyCode) {
                        case 80:
                            // p
                            this.requestPresentationMode();
                            handled = true;
                            break;
                        case 71:
                            // g
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
                if (curElementTagName === 'INPUT' || curElementTagName === 'TEXTAREA' || curElementTagName === 'SELECT') {
                    // Make sure that the secondary toolbar is closed when Escape is pressed.
                    if (evt.keyCode !== 27) {
                        // 'Esc'
                        return;
                    }
                }
                var ensureViewerFocused = false;

                if (cmd === 0) {
                    // no control key pressed at all.
                    switch (evt.keyCode) {
                        case 38: // up arrow
                        case 33: // pg up
                        case 8:
                            // backspace
                            if (!isViewerInPresentationMode && pdfViewer.currentScaleValue !== 'page-fit') {
                                break;
                            }
                        /* in presentation mode */
                        /* falls through */
                        case 37:
                            // left arrow
                            // horizontal scrolling using arrow keys
                            if (pdfViewer.isHorizontalScrollbarEnabled) {
                                break;
                            }
                        /* falls through */
                        case 75: // 'k'
                        case 80:
                            // 'p'
                            this.page--;
                            handled = true;
                            break;
                        case 27:
                            // esc key
                            if (this.secondaryToolbar.isOpen) {
                                this.secondaryToolbar.close();
                                handled = true;
                            }
                            if (!this.supportsIntegratedFind && this.findBar.opened) {
                                this.findBar.close();
                                handled = true;
                            }
                            break;
                        case 40: // down arrow
                        case 34: // pg down
                        case 32:
                            // spacebar
                            if (!isViewerInPresentationMode && pdfViewer.currentScaleValue !== 'page-fit') {
                                break;
                            }
                        /* falls through */
                        case 39:
                            // right arrow
                            // horizontal scrolling using arrow keys
                            if (pdfViewer.isHorizontalScrollbarEnabled) {
                                break;
                            }
                        /* falls through */
                        case 74: // 'j'
                        case 78:
                            // 'n'
                            this.page++;
                            handled = true;
                            break;

                        case 36:
                            // home
                            if (isViewerInPresentationMode || this.page > 1) {
                                this.page = 1;
                                handled = true;
                                ensureViewerFocused = true;
                            }
                            break;
                        case 35:
                            // end
                            if (isViewerInPresentationMode || this.pdfDocument && this.page < this.pagesCount) {
                                this.page = this.pagesCount;
                                handled = true;
                                ensureViewerFocused = true;
                            }
                            break;

                        case 72:
                            // 'h'
                            if (!isViewerInPresentationMode) {
                                this.handTool.toggle();
                            }
                            break;
                        case 82:
                            // 'r'
                            this.rotatePages(90);
                            break;
                    }
                }

                if (cmd === 4) {
                    // shift-key
                    switch (evt.keyCode) {
                        case 32:
                            // spacebar
                            if (!isViewerInPresentationMode && pdfViewer.currentScaleValue !== 'page-fit') {
                                break;
                            }
                            this.page--;
                            handled = true;
                            break;

                        case 82:
                            // 'r'
                            this.rotatePages(-90);
                            break;
                    }
                }

                if (!handled && !isViewerInPresentationMode) {
                    // 33=Page Up  34=Page Down  35=End    36=Home
                    // 37=Left     38=Up         39=Right  40=Down
                    // 32=Spacebar
                    if (evt.keyCode >= 33 && evt.keyCode <= 40 || evt.keyCode === 32 && curElementTagName !== 'BUTTON') {
                        ensureViewerFocused = true;
                    }
                }

                if (cmd === 2) {
                    // alt-key
                    switch (evt.keyCode) {
                        case 37:
                            // left arrow
                            if (isViewerInPresentationMode) {
                                this.pdfHistory.back();
                                handled = true;
                            }
                            break;
                        case 39:
                            // right arrow
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
        }, {
            key: 'beforePrint',
            value: function beforePrint(evt) {
                this.eventBus.dispatch('beforeprint');
            }
        }, {
            key: 'afterPrint',
            value: function afterPrint(evt) {
                this.eventBus.dispatch('afterprint');
            }
        }, {
            key: 'pagesCount',
            get: function get() {
                return this.pdfDocument.numPages;
            }
        }, {
            key: 'page',
            set: function set(val) {
                this.pdfLinkService.page = val;
            },
            get: function get() {
                // TODO remove
                return this.pdfLinkService.page;
            }
        }, {
            key: 'supportsPrinting',
            get: function get() {
                var canvas = document.createElement('canvas');
                var value = 'mozPrintCallback' in canvas;

                return pdfjsLib.shadow(this, 'supportsPrinting', value);
            }
        }, {
            key: 'supportsFullscreen',
            get: function get() {
                //#if MOZCENTRAL
                //var support = document.fullscreenEnabled === true;
                //#else
                var doc = document.documentElement;
                var support = !!(doc.requestFullscreen || doc.mozRequestFullScreen || doc.webkitRequestFullScreen || doc.msRequestFullscreen);

                if (document.fullscreenEnabled === false || document.mozFullScreenEnabled === false || document.webkitFullscreenEnabled === false || document.msFullscreenEnabled === false) {
                    support = false;
                }
                //#endif
                if (support && pdfjsLib.PDFJS.disableFullscreen === true) {
                    support = false;
                }

                return pdfjsLib.shadow(this, 'supportsFullscreen', support);
            }
        }, {
            key: 'supportsIntegratedFind',
            get: function get() {
                return this.externalServices.supportsIntegratedFind;
            }
        }, {
            key: 'supportsDocumentFonts',
            get: function get() {
                return this.externalServices.supportsDocumentFonts;
            }
        }, {
            key: 'supportsDocumentColors',
            get: function get() {
                return this.externalServices.supportsDocumentColors;
            }
        }, {
            key: 'loadingBar',
            get: function get() {
                var loadingBarElement = this.container.parentNode.querySelector('#loadingBar .progress');
                var bar = new ProgressBar(loadingBarElement, {});

                return pdfjsLib.shadow(this, 'loadingBar', bar);
            }
        }, {
            key: 'supportedMouseWheelZoomModifierKeys',
            get: function get() {
                return this.externalServices.supportedMouseWheelZoomModifierKeys;
            }
        }, {
            key: 'hasEqualPageSizes',
            get: function get() {
                var firstPage = this.pdfViewer.getPageView(0);
                for (var i = 1, ii = this.pagesCount; i < ii; ++i) {
                    var pageView = this.pdfViewer.getPageView(i);
                    if (pageView.width !== firstPage.width || pageView.height !== firstPage.height) {
                        return false;
                    }
                }
                return true;
            }
        }]);

        return PDFViewerApplication;
    }();

    //#if GENERIC


    var HOSTED_VIEWER_ORIGINS = ['null', 'http://mozilla.github.io', 'https://mozilla.github.io'];
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
            var loadingErrorMessage = mozL10n.get('loading_error', null, 'An error occurred while loading the PDF.');

            var moreInfo = {
                message: message
            };
            this.error(loadingErrorMessage, moreInfo);
            throw e;
        }
    }
    //#endif

    function loadAndEnablePDFBug(enabledTabs) {
        var _this13 = this;

        return new Promise(function (resolve, reject) {
            var appConfig = _this13.appConfig;
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
            (document.getElementsByTagName('head')[0] || document.body).appendChild(script);
        });
    }

    exports.PDFViewerApplication = PDFViewerApplication;
    exports.DefaultExernalServices = DefaultExernalServices;
}));
