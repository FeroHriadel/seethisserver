const Spot = require('../models/spotModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Tag = require('../models/tagModel');
const formidable = require('formidable');
const slugify = require('slugify');
const fs = require('fs');




exports.createSpot = async (req, res) => {
    try {
        //init new form
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        
        //grab form data
        form.parse(req, (err, fields, files) => {

            //validate
            if (err) {
                return res.status(400).json({error: 'Spot upload failed'});
            }

            const { category, tags, title, lat, long, body } = fields;
            if ( 
                !title || title === '' ||
                !category || category === '' ||
                !lat || lat === '' ||
                !long || long === '' ||
                !body || body === ''
            ) return res.status(400).json({error: `category, title, gps & spot description are required`});

            //populate spot
            let tagArr; //somehow the tags come in a string. This makes them into an array.
            if (tags) {
                tagArr = tags.split(',');
            }

            let spot = new Spot();
            spot.title = title;
            spot.tags = tagArr;
            spot.category = category;
            spot.lat = lat;
            spot.long = long;
            spot.body = body;
            spot.excerpt = body.substring(0, 320).replace(/(<([^>]+)>)/gi, "") + '...';
            spot.slug = slugify(title).toLowerCase();
            spot.postedBy = req.userEmail;

            //grab image
            if (files.image) {
                if (files.image.size > 50000000) {
                    return res.status(400).json({error: 'Image size 5Mb exceeded'});
                }

                spot.image.data = fs.readFileSync(files.image.path);
                spot.image.contentType = files.image.type;
            }

            //save spot
            spot.save((err, spot) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({error: `Spot could not be saved`});
                }

                //respond with saved spot
                res.json(spot);
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (createSpot)`});
    }
}



exports.getSpotImage = (req, res) => {
    try {
        const spotslug = req.params.spotslug.toLowerCase();
        if (!spotslug) {
            return res.json(400).json({error: `Spot slug not provided`})
        }

        Spot.findOne({slug: spotslug})
            .select('image')
            .exec((err, spot) => {
                if (err || !spot) {
                    return res.status(404).json({error: `Spot could not be found`});
                }

                res.set('Content-Type', spot.image.contentType);
                return res.send(spot.image.data);
            })

            //get this image in frontend like this:
            // <img src='http://localhost:8000/api/getspotimage/name-of-the-spot-slug'
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getSpotImage)`})
    }
}



//THIS DOES SEARCH AND PAGINATION TOO
exports.getSpots = async (req, res) => {
    try {
        //pagination
        const pageSize = 4;
        const page = Number(req.query.pageNumber) || 1;

        //searchword
        const searchword = req.query.searchword ?
        {$or: [{title: {$regex: req.query.searchword, $options: 'i'}}, {body: {$regex: req.query.searchword, $options: 'i'}}]}
        :
        {}

        const category = req.query.category ?
        {category: req.query.category}
        :
        {}

        //tag
        const tag = req.query.tag ?
        {tags: req.query.tag}
        :
        {}

        //postedBy (email)
        const postedBy = req.query.postedBy ?
        {postedBy: {$regex: req.query.postedBy, $options: 'i'}}
        :
        {}

        //sortBy
        const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'

        //order
        const order = req.query.order ? req.query.order : 'desc'

        //perfrom search:
        const spotsLength = await Spot.countDocuments({...searchword, ...category, ...tag, ...postedBy});

        const spots = await Spot.find({...searchword, ...category, ...tag, ...postedBy})
            .select('-image')
            .sort([[sortBy, order]]) //.sort([['createdAt', 'desc']])
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('category', 'name')
            .populate('tags', 'name');

        //response
        if (!spots || spots.length === 0) {
            return res.status(404).json({error: `No spots found`});
        }

        res.json({spots, page, numberOfPages: Math.ceil(spotsLength / pageSize)});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getSpots)`})
    }
}



exports.getSpotBySlug = async (req, res) => {
    try {
        const slug = req.query.slug.toLowerCase();
        if (!slug) {
            return res.status(400).json({error: `No slug provided`});
        }

        const spot = await Spot.findOne({slug}).select('-image').populate('category', 'name').populate('tags', 'name');
        if (!spot) {
            return res.status(404).json({error: `Spot could not be found`});
        }

        res.json(spot);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getSpotBySlug)`})
    }
}



exports.editSpot = async (req, res) => {
    try {
        //init form
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        
        //grab form data
        form.parse(req, async (err, fields, files) => {

            //validate
            if (err) {
                return res.status(400).json({error: 'Spot upload failed'});
            }

            const { category, tags, title, lat, long, body, spotId } = fields;
            if ( 
                !title || title === '' ||
                !category || category === '' ||
                !lat || lat === '' ||
                !long || long === '' ||
                !body || body === ''
            ) return res.status(400).json({error: `category, title, gps & spot description are required`});

            //check if spot exists
            const spot = await Spot.findById(spotId);
            if (!spot) {
                return res.status(404).json({message: 'Spot not found'})
            }

            //populate spot
            let tagArr; //somehow the tags come in a string. This makes them into an array.
            if (tags) {
                tagArr = tags.split(',');
            }

            spot.title = title;
            spot.tags = tagArr;
            spot.category = category;
            spot.lat = lat;
            spot.long = long;
            spot.body = body;
            spot.excerpt = body.substring(0, 320).replace(/(<([^>]+)>)/gi, "") + '...';
            // spot.slug = slugify(title).toLowerCase();    //slug stays the same for SEO purposes

            //grab image
            if (files.image) {
                if (files.image.size > 50000000) {
                    return res.status(400).json({error: 'Image size 5Mb exceeded'});
                }

                spot.image.data = fs.readFileSync(files.image.path);
                spot.image.contentType = files.image.type;
            }

            //save spot
            spot.save((err, spot) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({error: `Spot could not be saved`});
                }

                //respond with saved spot
                res.json(spot);
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (editSpot)`});
    }
}



exports.getSpotsByEmail = async (req, res) => {
    try {
        const userEmail = req.userEmail;
        if (!userEmail) {
            return res.json({error: `No email received from authCheck`});
        }

        const spots = await Spot.find({postedBy: userEmail}).populate('category', 'name').populate('tags', 'name');
        if (!spots) {
            return res.status(404).json('No spots could be found');
        }

        spots.forEach(spot => spot.image = undefined);

        res.json(spots);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getSpotsByEmail)`})
    }
}



exports.deleteSpot = async (req, res) => {
    try {
        const spotId = req.params.spotId;
        if (!spotId) {
            return res.status(400).json({error: `SpotId not provided`});
        }

        Spot.findByIdAndRemove(spotId).exec((err, succes) => {
            if (err) {
                console.log(err);
                return res.status(400).json({error: `Spot could not be deleted`});
            }

            res.json({message: `Spot deleted`});
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (deleteSpot)`})
    }
}



exports.getSpotsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({error: `categoryId is required`})
        }

        const spots = await Spot.find({category: categoryId});
        if (!spots) {
            return res.status(404).json({error: `Spots not found`});
        }

        res.json(spots);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getSpotsByCategory)`});
    }
}