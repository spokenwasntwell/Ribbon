/**
 * @file Ribbon Applet - initiates an instance of Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
 */

/* eslint-disable no-mixed-requires, one-var */
import Ribbon from './Ribbon';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const start = () => new Ribbon((/(?:bow)/i).test(process.argv[2]) ? process.env.stripetoken : process.env.ribbontoken).init();

start();