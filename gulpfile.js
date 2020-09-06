const gulp = require(`gulp`);
const plumber = require(`gulp-plumber`);
const sourcemap = require(`gulp-sourcemaps`);
const sass = require(`gulp-sass`);
const postcss = require(`gulp-postcss`);
const csso = require(`gulp-csso`);
const autoprefixer = require(`autoprefixer`);
const imagemin = require(`gulp-imagemin`);
const svgstore = require(`gulp-svgstore`);
const toWebp = require(`gulp-webp`);
const uglify = require(`gulp-uglify-es`).default;
const rename = require(`gulp-rename`);
const sync = require(`browser-sync`).create();
const posthtml = require(`gulp-posthtml`);
const include = require(`posthtml-include`);
const htmlmin = require(`gulp-htmlmin`);
const del = require(`del`);
const gulpif = require(`gulp-if`);
const newer = require(`gulp-newer`);

const isProduction = process.env.NODE_ENV === `production`;

const html = () => {
  return gulp.src(`source/*.html`)
    .pipe(posthtml([include({root: `source`})]))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(`build`))
    .pipe(sync.stream());
};

const styles = () => {
  return gulp.src(`source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename(`style.min.css`))
    .pipe(sourcemap.write(`.`))
    .pipe(gulp.dest(`build/css`))
    .pipe(sync.stream());
}

const scripts = () => {
  return gulp.src(`source/js/main.js`)
    .pipe(uglify())
    .pipe(rename(`main.min.js`))
    .pipe(gulp.dest(`build/js`))
    .pipe(sync.stream());
};

const fonts = () => {
  const destDir = `build/fonts`;
  return gulp.src(`source/fonts/**`)
    .pipe(newer(destDir))
    .pipe(gulp.dest(destDir))
}

const optimizeImages = () => {
  const destDir = `build/img`;
  return gulp.src(`source/img/*.{png,jpg,svg}`)
    .pipe(newer(destDir))
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(destDir));
};

const copyImages = () => {
  return gulp.src(`source/img/*.{png,jpg,svg}`)
    .pipe(gulp.dest(`build/img`))
};

const webp = () => {
  const destDir = `build/img/webp`;
  return gulp.src(`source/img/*.{png,jpg}`)
    .pipe(newer(destDir))
    .pipe(toWebp({quality: 70}))
    .pipe(gulp.dest(destDir));
};

const sprite = () => {
  return gulp.src(`source/img/sprite/**`)
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename(`sprite.svg`))
    .pipe(gulp.dest(`build/img`));
};

const images = gulp.series(
  gulpif(isProduction,
    gulp.series(optimizeImages, webp, sprite),
    gulp.series(copyImages, webp, sprite))
);

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

const reload = (done) => {
  sync.reload();
  done();
};

const watcher = () => {
  gulp.watch(`source/**/*.html`, gulp.series(html));
  gulp.watch(`source/sass/**/*.scss`, gulp.series(styles));
  gulp.watch(`source/js/**/*.js`, gulp.series(scripts));
  gulp.watch(`source/fonts/**`, gulp.series(fonts, reload));
  gulp.watch(`source/img/sprite/**`, gulp.series(sprite, reload));
  gulp.watch(`source/img/*.{jpg,png,svg}`, gulp.series(images, reload));
};

const clean = () => del(`build`);

const build = gulp.series(clean, html, styles, scripts, fonts, images);

const start = gulp.series(build, server, watcher);

module.exports = {
  html,
  styles,
  scripts,
  fonts,
  copyImages,
  optimizeImages,
  webp,
  sprite,
  images,
  server,
  clean,
  build,
  start
};
