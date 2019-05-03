'use strict';

const Generator = require('yeoman-generator');
const inquirer = require('inquirer');
const Promise = require('bluebird');
const util = require('util');
const path = require('path');
const yosay = require('yosay');
const glob = require('glob');
const _ = require('lodash');
const fs = require('fs-extra');
const emptyDir = require('empty-dir');
const klawSync = require('klaw-sync');

module.exports = class extends Generator {
    
    constructor(args, opts) {
        
        super(args, opts);
        
        this.argument('dest', {
            'desc': `Destination folder`,
            'type': String,
            'required': false
        });
        
    }
    
    prompting() {
        
        this._step1();
        return this._step2();
        
    }
    
    writing() {
        
        this._step3();
        
    }
    
    install() {
        
        this.installDependencies({
            'npm': true,
            'yarn': false,
            'bower': false
        });
        
    }
    
    _step1() {
        
        Object.defineProperties(this, {
            'sourceFiles': {
                'value': klawSync(this.sourceRoot())
            },
            'destFolder': {
                'value': (() => {
                    if (this.options.dest) {
                        if (path.isAbsolute(this.options.dest)) {
                            return this.options.dest;
                        } else {
                            return this.destinationPath(this.options.dest);
                        }
                    } else {
                        return this.destinationRoot();
                    }
                })()
            },
            'onError': {
                'value': (message) => {
                    message = _.isArray(message) ? message : [message];
                    message.forEach((msg) => {
                        console.log(msg);
                    });
                    process.exit(1);
                }
            },
            'templateFiles': {
                'value': [
                    'package.json',
                    'public/index.html'
                ]
            }
        });
        
    }
    
    _step2() {

        const noPrompt = process.argv.includes('--no-prompt');
        let canContinue;

        if (noPrompt) {
            canContinue = Promise.resolve({
                continue: true
            });
        } else {
            canContinue = inquirer.prompt([
                {
                    'type': 'confirm',
                    'name': 'continue',
                    'message': `Create new project in this folder? If this folder already exists, its contents will be deleted. (${this.destFolder})`,
                    'default': false
                }
            ]);
        }
        
        canContinue
            .then((res) => {
                
                if (!res.continue) {
                    return this.onError(`Setup canceled.`);
                }

                if (noPrompt) {
                    return {
                        name: path.basename(this.destFolder)
                    };
                }
                
                return inquirer.prompt([
                    {
                        'type': 'text',
                        'name': 'name',
                        'message': `Project Name`,
                        'default': path.basename(this.destFolder),
                        'validate': (value) => {
                            return value ? true : false;
                        },
                        'filter': (value) => {
                            return String(value).trim();
                        }
                    }
                ]);
                
            })
            .then((res) => {
                
                this.projectName = res.name;
                
            });
        
    }
    
    _step3() {

        fs.emptyDirSync(this.destFolder);

        fs.copySync(this.sourceRoot(), this.destFolder);

        this.templateFiles.forEach((file) => {
            fs.removeSync(path.resolve(this.destFolder, file));
        });

        this.fs.copyTpl(
            this.templatePath('package.json'),
            path.resolve(this.destFolder, 'package.json'),
            {
                'projectName': this.projectName
            }
        );
        
        this.fs.copyTpl(
            this.templatePath('public/index.html'),
            path.resolve(this.destFolder, 'public/index.html'),
            {
                'projectName': this.projectName
            }
        );
        
    }
    
};
