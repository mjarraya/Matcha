#!/bin/bash
cd api
npm install
npm start &
cd ../app
npm install
npm start
