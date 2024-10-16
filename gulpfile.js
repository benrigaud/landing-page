const gulp = require( 'gulp' );
const replace = require( 'gulp-replace' );
const moment = require( 'moment' );
const sass = require( 'gulp-sass' )( require( 'sass' ) );
const cached = require( 'gulp-cached' );
const newer = require( 'gulp-newer' ); // Optimized for caching
const postcss = require( 'gulp-postcss' );
const sourcemaps = require( 'gulp-sourcemaps' );
const browser_sync = require( 'browser-sync' ).create(); // Proper initialization
const autoprefixer = require( 'autoprefixer' );
const cssnano = require( 'cssnano' );
const rename = require( 'gulp-rename' );
const tinypng = require( 'gulp-tinypng-compress' );
const webpack_stream = require( 'webpack-stream' );
const webpack = require( 'webpack' );
const copy_webpack_plugin = require( 'copy-webpack-plugin' );

// Config
const config = {
	src_path: './src/',
	dist_path: './dist/',
	environment: 'production',
	tiny_png_api_key: 'axN_g3gPEVQ3DqEBpAfnQD7VZ8C0Tp5O',
	wataching: true
};

// Cache Busting Function
const getTimestamp = () => moment().format( 'YYYYMMDDHHmmss' );

// Cache Busting Task (for production only)
const cacheBust = () => {
	return gulp
		.src( '**/*.html' )
		.pipe( replace( /href="(.+)\.css"/g, `href="$1.css?${getTimestamp()}"` ) )
		.pipe( replace( /src="(.+)\.js"/g, `src="$1.js?${getTimestamp()}"` ) )
		.pipe( gulp.dest( './' ) );
};

// Styles Task
const styles = () => {
	return gulp
		.src( config.src_path + 'scss/**/*.scss' )
		.pipe( sourcemaps.init() )
		// .pipe( cached( 'sass' ) ) // Cache compiled SASS files
		.pipe(
			sass( {outputStyle: 'compressed'} ).on( 'error', sass.logError )
		)
		.pipe(
			postcss( [
				autoprefixer(),
				cssnano( {
					discardComments: {removeAll: true},
					minifySelectors: {disable: true},
				} ),
			] )
		)
		.pipe( sourcemaps.write() )
		.pipe( rename( {suffix: '.min'} ) )
		.pipe( gulp.dest( config.dist_path + 'css' ) )
		.pipe( browser_sync.stream() );
};

// Scripts Task
const scripts = () => {
	return gulp
		.src( config.src_path + 'js/main.js' )
		.pipe(
			webpack_stream(
				{
					mode: config.environment,
					module: {
						rules: [
							{
								test: /\.m?js$/,
								exclude: /(node_modules|bower_components)/,
								use: {
									loader: 'babel-loader',
									options: {
										presets: ['@babel/preset-env'],
										cacheDirectory: true, // Caching
									},
								},
							},
						],
					},
					performance: {
						hints: false,
						maxEntrypointSize: 512000,
						maxAssetSize: 512000,
					},
					output: {
						filename: 'bundle.min.js',
					},
					plugins: [
						new copy_webpack_plugin( {
							patterns: [
								{
									from: './node_modules/@fortawesome/fontawesome-pro/webfonts',
									to: '../font',
								},
							],
						} ),
						new webpack.ProvidePlugin( {
							$: 'jquery',
							jquery: 'jQuery',
							'window.jQuery': 'jquery',
						} ),
					],
					externals: {
						jquery: 'jQuery',
					},
					devtool: 'source-map',
					watch: config.watching,
				},
				webpack
			)
		)
		.pipe( gulp.dest( config.dist_path + 'js' ) );
};

// Images Task (using gulp-newer for optimization)
const images = () => {
	return gulp
		.src( config.src_path + 'img/**/*.{png,jpg,jpeg}' )
		.pipe( newer( config.dist_path + 'img' ) ) // Process only newer images
		.pipe( tinypng( {
			key: config.tiny_png_api_key,
			sigFile: config.dist_path + 'img/.tinypng-sigs',
			log: true,
			summarize: true
		} ) )
		.pipe( gulp.dest( config.dist_path + 'img' ) );
};

// Browsersync Task
const reload = ( done ) => {
	browser_sync.init( {
		server: {
			baseDir: './',
		},
	} );
	done();
};

// Watch Task
const watchFiles = () => {
	gulp.watch( config.src_path + 'scss/**/*.scss', styles );
	gulp.watch( config.src_path + 'js/**/*.js', scripts );
	gulp.watch( '*.html' ).on( 'change', browser_sync.reload );
};

// Build Task
gulp.task( 'build', gulp.series(
	function setConfig( done ) {
		config.watching = false;
		done();
	},
	styles,
	scripts,
	cacheBust,
	images
) );

// Default Task
gulp.task( 'default', gulp.parallel( gulp.parallel( styles, scripts ), reload, watchFiles ) );

// Images Task
gulp.task( 'images', images );
