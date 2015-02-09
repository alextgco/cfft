module.exports = function (grunt) {

	grunt.initConfig({
		coffee: {
			options: {},
			coffeeCompileDistribution: {
				expand: true,
				flatten: true,
				cwd: 'assets/coffee/',
				src: ['*.coffee'],
				dest: 'assets/js/',
				ext: '.js'
			}
		},
		watch: {
			options: {
				livereload: true
			},
			coffeeWatching: {
				files: ['assets/coffee/*.coffee'],
				tasks: ['newer:coffee']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-newer');

	grunt.registerTask('default', ['coffee', 'watch']);

};