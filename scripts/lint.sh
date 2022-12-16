#!/bin/bash

set -e
set -x

eslint .
remark . --ext '.md,.mdx'
stylelint '**/*.scss'
