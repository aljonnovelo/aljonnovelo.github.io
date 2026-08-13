const browserSync = require('browser-sync').create();
const cp = require('child_process');

const isWindows = process.platform === 'win32';
const jekyll = isWindows ? 'cmd.exe' : 'jekyll';

const scssPath = '_scss/**/*.scss';
const jsPath = '_scripts/*.js';
const templatePath = [
  '*.html',
  '+(_includes|_layouts)/*.html',
  '*.yml',
  '_data/*.yml',
  '_posts/*',
];

module.exports = gulp => {
  const reloadBrowser = done => {
    browserSync.reload();
    done();
  };

  // Run `jekyll build`
  gulp.task('jekyll-build', done => {
    const args = isWindows
      ? ['/c', 'jekyll', 'build']
      : ['build'];

    return cp
      .spawn(jekyll, args, { stdio: 'inherit' })
      .on('close', done);
  });

  // Run `jekyll build` with _config_dev.yml
  gulp.task('jekyll-dev', done => {
    const args = isWindows
      ? ['/c', 'jekyll', 'build', '--config', '_config.yml,_config_dev.yml']
      : ['build', '--config', '_config.yml,_config_dev.yml'];

    return cp
      .spawn(jekyll, args, { stdio: 'inherit' })
      .on('close', done);
  });

  // Rebuild Jekyll then reload the page
  gulp.task('jekyll-rebuild', gulp.series('jekyll-dev', reloadBrowser));

  gulp.task(
    'serve',
    gulp.series('jekyll-dev', () => {
      browserSync.init({
        server: {
          baseDir: '_site',
        },
      });

      gulp.watch(scssPath, gulp.series('sass', reloadBrowser));
      gulp.watch(jsPath, gulp.series('scripts', reloadBrowser));
      gulp.watch(templatePath, gulp.task('jekyll-rebuild'));
    })
  );
};