<?php
/*
This file is just for rapid development. In production, the data could come from a database or any other source.
*/

function minify($code) {
    $search = array(
         
        // Remove whitespaces after tags
        '/\>[^\S ]+/s',
         
        // Remove whitespaces before tags
        '/[^\S ]+\</s',
         
        // Remove multiple whitespace sequences
        '/(\s)+/s',
         
        // Removes comments
        '/<!--(.|\s)*?-->/'
    );
    $replace = array('>', '<', '\\1');
    $code = preg_replace($search, $replace, $code);
    return $code;
}



$allProjects = array();

// Knoxy3D
$allProjects[0] = (object) [
    'name' => 'knoxy3d',
    'title' => 'Knoxy.tk (3D)',
    'desc' => 'Fullscreen 3D wrapper for my portfolio website. &nbsp; Created in 2023.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/knoxy3d.webp">
                        <source type="image/png" srcset="assets/img/portfolio/knoxy3d.png">
                        <img src="assets/img/portfolio/knoxy3d.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the site was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Custom Engine + UI<br></p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>Fusion 360</li>
                  <li>Blender</li>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript
                    <ul>
                      <li>Three.js</li>
                    </ul>
                  </li>
                  <li>Apache</li>
                  <li>Nginx</li>
                  <li>Linux (Ubuntu)</li>
                  <li>Docker</li>
                </ul>
              ')
];

// Knoxy2D
$allProjects[1] = (object) [
    'name' => 'knoxy2d',
    'title' => 'Knoxy.tk (2D)',
    'desc' => 'My portfolio website. &nbsp; Created in 2023.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/knoxy2d.webp">
                        <source type="image/png" srcset="assets/img/portfolio/knoxy2d.png">
                        <img src="assets/img/portfolio/knoxy2d.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the site was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the site and why they are useful</p>
                <br>
                <h3>Stack / Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS
                    <ul>
                      <li>Bootstrap</li>
                      <li>FontAwesome</li>
                    </ul>
                  </li>
                  <li>JavaScript
                    <ul>
                      <li>jQuery</li>
                      <li>jQuery.sticky</li>
                    </ul>
                  </li>
                  <li>PHP</li>
                  <li>Apache</li>
                  <li>Nginx</li>
                  <li>Linux (Ubuntu)</li>
                  <li>Docker</li>
                </ul>
              ')
];

// Slot Machine
$allProjects[2] = (object) [
    'name' => 'slotmachine',
    'title' => 'Slot Machine',
    'desc' => 'A short description here. &nbsp; Created in 2022.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/slotmachine.webp">
                        <source type="image/png" srcset="assets/img/portfolio/slotmachine.png">
                        <img src="assets/img/portfolio/slotmachine.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the site was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the site and why they are useful</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>WebAnimations</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>Apache</li>
                  <li>Nginx</li>
                  <li>Linux (Ubuntu)</li>
                </ul>
              ')
];

// Bella Pizzeria Website
$allProjects[3] = (object) [
    'name' => 'bellasite',
    'title' => 'Bella Pizzeria',
    'desc' => 'The official website for Bella Pizzeria. &nbsp; Created in 2018.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                    <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/bellasite.webp">
                        <source type="image/png" srcset="assets/img/portfolio/bellasite.png">
                        <img src="assets/img/portfolio/bellasite.png">
                    </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the site was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the site and why they are useful</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>WordPress</li>
                  <li>Linux (Ubuntu)</li>
                  <li>Apache</li>
                  <li>HostGator</li>
                </ul>
              ')
];

// Bella Pizzeria Web Tools
$allProjects[4] = (object) [
    'name' => 'bwr',
    'title' => 'Bella Pizzeria Web Tools',
    'desc' => 'Back-office dashboard and tools suite for internal use by Bella Pizzeria administrators. &nbsp; 
               Created 2016-2023',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/bwr.webp">
                        <source type="image/png" srcset="assets/img/portfolio/bwr.png">
                        <img src="assets/img/portfolio/bwr.png">
                      </picture>
                    </div>
                    <div class="slide fade">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/tools.webp">
                        <source type="image/png" srcset="assets/img/portfolio/tools.png">
                        <img src="assets/img/portfolio/tools.png">
                      </picture>
                    </div>
                    <div class="slide fade">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/bellaDih.webp">
                        <source type="image/png" srcset="assets/img/portfolio/bellaDih.png">
                        <img src="assets/img/portfolio/bellaDih.png">
                      </picture>
                    </div>
                    <a class="prev" onclick="moveSlides(-1)">&#10094;</a>
                    <a class="next" onclick="moveSlides(1)">&#10095;</a>
                </div>
                <br>
                <div style="text-align:center">
                    <span class="dot active" onclick="showSlide(1)"></span> &nbsp;
                    <span class="dot" onclick="showSlide(2)"></span> &nbsp;
                    <span class="dot" onclick="showSlide(3)"></span> 
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the tool suite was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the features: Central dashboard ties everything together</p>
                <br>
                <h3>Tools</h3>
                <p>Delco Items History, EPTL Manager, Tablet Manager, PSA, DSDG, CCSDA, WPI, etc.</p>
              ')
];

// Electronic Pizza Time Logs
$allProjects[5] = (object) [
    'name' => 'eptl',
    'title' => 'Electronic Pizza Time Logs',
    'desc' => 'Custom app for Bella Pizzeria designed to run on Amazon Fire tablets.
                &nbsp; Created in 2017.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/eptl.webp">
                        <source type="image/png" srcset="assets/img/portfolio/eptl.png">
                        <img src="assets/img/portfolio/eptl.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the app was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the app and why they are useful</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>Cordova</li>
                  <li>Android SDK</li>
                  <li>Amazon FireOS</li>
                </ul>
              ')
];

// Northside Christian Softball League
$allProjects[6] = (object) [
    'name' => 'ncsl',
    'title' => 'Northside Christian Softball League',
    'desc' => 'Custom website built for a local church-sponsored softball league.
                &nbsp; Created in 2016.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/ncsl.webp">
                        <source type="image/png" srcset="assets/img/portfolio/ncsl.png">
                        <img src="assets/img/portfolio/ncsl.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the site was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the site and why they are useful</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>Linux (Ubuntu)</li>
                  <li>Apache</li>
                  <li>1 &amp; 1 Hosting</li>
                </ul>
              ')
];

// Bella EODA
$allProjects[7] = (object) [
    'name' => 'eoda',
    'title' => 'Bella End-of-Day Assistant',
    'desc' => 'Progressive Web App for Bella Pizzeria closing managers.
                &nbsp; Created in 2017.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/eoda.webp">
                        <source type="image/png" srcset="assets/img/portfolio/eoda.png">
                        <img src="assets/img/portfolio/eoda.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the app was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the app and why they are useful</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>MacOS</li>
                  <li>Apache</li>
                  <li>Domain name configuration</li>
                </ul>
              ')
];

// IVI Dashboard
$allProjects[8] = (object) [
    'name' => 'ividash',
    'title' => 'IVI Dashboard',
    'desc' => 'Custom dashboard for the Interactive Visitor Intelligence platform.
                &nbsp; Created in 2014-2015.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                    <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/ividash.webp">
                        <source type="image/png" srcset="assets/img/portfolio/ividash.png">
                        <img src="assets/img/portfolio/ividash.png">
                    </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the app was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the app and why they are useful</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>Linux (centOS + Ubuntu) </li>
                  <li>Apache</li>
                  <li>MediaTemple VPS</li>
                  <li>Domain name configuration</li>
                </ul>
              ')
];

// Bella DDAR
$allProjects[9] = (object) [
    'name' => 'ddar',
    'title' => 'Doordash Drive Auto Request',
    'desc' => 'Custom PWA for Bella Pizzeria to easily dispatch delivery orders to Doordash Drive.
                &nbsp; Created in 2021.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                    <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/ddar.webp">
                        <source type="image/png" srcset="assets/img/portfolio/ddar.png">
                        <img src="assets/img/portfolio/ddar.png">
                    </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the app was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the various features of the app and why they are useful</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>Linux (Ubuntu)</li>
                  <li>Apache</li>
                  <li>AWS</li>
                  <li>CloudFlare</li>
                </ul>
              ')
];


// Auto Dealer Results Promos
$allProjects[10] = (object) [
    'name' => 'promos',
    'title' => 'Auto Dealer Promos',
    'desc' => 'Various promo sites built to drive sales for automotive dealerships.
                &nbsp; Created in 2013-2014.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/tools.webp">
                        <source type="image/png" srcset="assets/img/portfolio/tools.png">
                        <img src="assets/img/portfolio/tools.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Users would be directed to the manufacturer-branded promo website where they could fill out a 
                form to generate a unique certificate, which could then be redeemed at participating auto dealerships.</p>
                <br>
                <h3>Features</h3>
                <p>Several different manufacturers: Chevrolet, Chrysler, Jeep, Dodge, Ram, Honda</p>
                <p>Multiple vehicle models, colors, trim features, addon packages, etc. with time-sensitive 
                incentives from the manufacturer that were unique to each make/model/trim and varied dynamically.</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>Linux (centOS)</li>
                  <li>Domain name &amp; hosting configuration</li>
                </ul>
              ')
];

// Auto Dealer Results Admin Dashboards
$allProjects[11] = (object) [
    'name' => 'adrdash',
    'title' => 'Auto Dealer Admin Dashboards',
    'desc' => 'Admin dashboards for the various auto dealer promo sites built for Auto Dealer Results.
                &nbsp; Created in 2014.',
    'data' => minify('
                <div class="slideshow-container">
                    <div class="slide fade" style="display:block">
                      <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/tools.webp">
                        <source type="image/png" srcset="assets/img/portfolio/tools.png">
                        <img src="assets/img/portfolio/tools.png">
                      </picture>
                    </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the project was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Multiple vehicle models, colors, trim features, addon packages, etc. with unique incentives from 
                the manufacturer that varied from month to month.</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>Linux (centOS)</li>
                  <li>Domain name &amp; hosting configuration</li>
                </ul>
              ')
];

// Bella InTime Tax Automator
$allProjects[12] = (object) [
    'name' => 'intime',
    'title' => 'InTime Tax Automator',
    'desc' => 'Custom script written for Bella Pizzeria to automatically file monthly business taxes.
                &nbsp; Created in 2022.',
    'data' => minify('
                <h3>Background</h3>
                <p>Show some background information to explain why the app was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the features</p>
              ')
];

// Arena History (WoW AddOn)
$allProjects[13] = (object) [
    'name' => 'wow',
    'title' => 'Arena History',
    'desc' => 'Custom add-on for World of Warcraft to track rated arena play. 
                &nbsp; Created in 2022.',
    'data' => minify('
                <div class="slideshow-container">
                  <div class="slide fade" style="display:block">
                    <picture>
                      <source type="image/webp" srcset="assets/img/portfolio/wow.webp">
                      <source type="image/png" srcset="assets/img/portfolio/wow.jpg">
                      <img src="assets/img/portfolio/wow.jpg">
                    </picture>
                  </div>
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the tool suite was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the features</p>
                <br>
                <h3>Languages Used</h3>
                <p>LUA &nbsp; &bull; &nbsp; XML</p>
              ')
];

// RockBand Bot
$allProjects[14] = (object) [
    'name' => 'rbbot',
    'title' => 'Rock Band Bot',
    'desc' => 'Designed to play Rock Band guitar on Expert difficulty.
                &nbsp; Created in 2015.',
    'data' => minify('
                <div class="slideshow-container">
                  <div class="slide fade" style="display:block">
                    <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/rbbot.webp">
                        <source type="image/png" srcset="assets/img/portfolio/rbbot.png">
                        <img src="assets/img/portfolio/rbbot.png">
                    </picture>
                  </div>
                  <div class="slide fade">
                    <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/rbbot2.webp">
                        <source type="image/png" srcset="assets/img/portfolio/rbbot2.jpg">
                        <img src="assets/img/portfolio/rbbot2.jpg">
                    </picture>
                  </div>
                  <a class="prev" onclick="moveSlides(-1)">&#10094;</a>
                  <a class="next" onclick="moveSlides(1)">&#10095;</a>
                </div>
                <br>
                <div style="text-align:center">
                    <span class="dot active" onclick="showSlide(1)"></span> &nbsp;
                    <span class="dot" onclick="showSlide(2)"></span> 
                </div>
                <h3>Background</h3>
                <p>Show some background information to explain why the tool suite was created in the first place.</p>
                <br>
                <h3>Features</h3>
                <p>Highlight the features</p>
                <br>
                <h3>Languages Used</h3>
                <p>C &nbsp; &bull; &nbsp; Bash &nbsp; &bull; &nbsp; VB.NET</p>
              ')
];

// The Mundies
$allProjects[15] = (object) [
    'name' => 'themundies',
    'title' => 'The Mundies',
    'desc' => 'Website I designed and built for a local indie band. &nbsp; Created in 2012.',
    'data' => minify('
                <p style="text-align:center">
                    <picture>
                        <source type="image/webp" srcset="assets/img/portfolio/themundies.webp">
                        <source type="image/png" srcset="assets/img/portfolio/themundies.png">
                        <img src="assets/img/portfolio/themundies.png">
                    </picture>
                </p>
                <h3>Features</h3>
                <p>Highlight the features</p>
                <br>
                <h3>Skills Used</h3>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                  <li>PHP</li>
                  <li>MySQL</li>
                  <li>Facebook API</li>
                  <li>Google Maps API</li>
                </ul>
              ')
];


?>