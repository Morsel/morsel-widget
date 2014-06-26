module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'execute': {
      'cache': {
        src: ['cache.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-execute');

  // Default task(s).
  grunt.registerTask('cache', ['execute:cache']);
};