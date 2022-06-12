import gulp from 'gulp';

const { src, dest, watch } = gulp;

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

import concat from 'gulp-concat-css';
import clean from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';

import browserSync from 'browser-sync';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

export const build = () => {
	return src('scss/main.scss')
		.pipe(sass.sync())
		.pipe(autoprefixer())
		.pipe(concat('main.css'))
		.pipe(clean())
		.pipe(dest('dist'));
};

const SITE_SLUG = 'chromozone';
const SITE_NAME = 'Chromozone_Wiki';

export const serve = async () => {
	console.log(`Fetching ${SITE_SLUG} wiki stylesheet...`);

	const url = `https://${SITE_SLUG}.fandom.com/wiki/${SITE_NAME}`;
	const res = await fetch(url);
	const body = await res.text();
	const $ = cheerio.load(body);
	const stylesheets = $('link[rel="stylesheet"]');

	let stylesheet = null;

	for (const el of stylesheets) {
		if (el.attribs['href'].includes('site.styles')) {
			stylesheet = el.attribs['href'];
			break;
		}
	}

	if (!stylesheet) {
		throw new Error('Could not find stylesheet');
	}

	console.log(`Found stylesheet: ${stylesheet}`);

	const styles = () => {
		return src('scss/main.scss')
			.pipe(sass.sync())
			.pipe(autoprefixer())
			.pipe(concat('main.css'))
			.pipe(clean())
			.pipe(dest('assets/css'))
			.pipe(browserSync.stream());
	};

	console.log(`Building ${SITE_SLUG} wiki stylesheet...`);

	styles();

	console.log(`Starting browser sync proxy...`);

	browserSync.init({
		proxy: url,
		plugins: ['bs-rewrite-rules'],
		files: ['assets/**'],
		injectChanges: true,
		cors: true,
		serveStatic: ['assets'],
		middleware: [
			{
				route: '/load.php',
				handle: (req, res, next) => {
					if (stylesheet.includes(req.url.substring(1))) {
						console.log(`Serving ${stylesheet}...`);
						res.writeHead(301, { Location: '/css/main.css' });
						res.end();
					}

					next();
				},
			},
		],
		callbacks: {},
	});

	console.log(`Watching for changes...`);

	return watch('scss/**/*.scss', styles);
};

export default build;
