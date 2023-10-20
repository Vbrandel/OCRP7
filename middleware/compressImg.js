const sharp = require('sharp');
const fs = require("fs");
const path = require("path");

module.exports = (req, res, next) => {
    try {
        if (!req.file) {
            next();
        }
        
        const filePathObject = path.parse(req.file.filename);
        // Etape 1 : on resize & convert
        sharp(req.file.path)
            .webp()
            .resize({width: 500,})
        // Etape 2 : Enregistrement
            .toFile(`images/${filePathObject.name}.webp`, () => {
        // Etape 3 : Suppression de l'image original
                fs.unlinkSync(`./images/${req.file.filename}`);
        // Etape 4 : On renomme le nouveau ficher
                req.file = {
                    filename: `${filePathObject.name}.webp`
                };
                next();
            })
            .catch(error => {
                res.status(400).json({ error });
            });
            } catch {
                (error) => res.status(401).json({ error });
            }
        };