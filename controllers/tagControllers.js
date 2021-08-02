const Tag = require('../models/tagModel');
const Spot = require('../models/spotModel');



exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || name === '') {
            return res.status(400).json({error: `Name is required`});
        }
        
        const tagExists = await Tag.findOne({name: name.toLowerCase().trim()});
        if (tagExists) {
            return res.status(400).json({error: 'Tag with such name already exists'});
        }

        const createdTag = await new Tag({name: name.toLowerCase().trim(), description: description}).save();
        if (!createdTag) {
            return res.status(500).json({error: `Tag couldn't be saved`});
        }

        res.json(createdTag);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (createTag)`})
    }
}



exports.getTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort([['name', 'asc']]);
        if (!tags) {
            return res.status(404).json({error: `No tags could be found`});
        }

        res.json(tags);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getTags)`})
    }
}



exports.getTagById = async (req, res) => {
    try {
        const { tagId } = req.params;
        if (!tagId) {
            return res.status(400).json({error: `tagId is required`});
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(404).json({error: `Tag could not be found`});
        }

        res.json(tag);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getTagByid)`});
    }
}



exports.editTag = async (req, res) => {
    try {
        const { tagId } = req.params;
        if (!tagId) {
            console.log('tagId problem') //
            return res.status(400).json({error: `tagId is required`});
        }

        const name = req.body.name;
        const description = req.body.description;
        if (!name) {
            console.log('body problem') //
            return res.status(400).json({error: `Tag name is required`})
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(404).json({error: `Tag not found`});
        }

        const updatedTag = await Tag.findByIdAndUpdate(tagId, {name, description}, {new: true});
        if (!updatedTag) {
            return res.status(500).json({error: `Tag update failed`});
        }

        res.json(updatedTag);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (editTag)`});
    }
}



exports.deleteTag = async (req, res) => {
    try {
        const { tagId } = req.params;
        if (!tagId) {
            return res.status(400).json({error: `tagId is required`});
        }

        //remove tag from all Spots that have it
        const spotsWithThisTag = await Spot.find({tags: tagId});
        spotsWithThisTag.forEach(spot => {
            let tagIndex = spot.tags.indexOf(tagId);
            spot.tags.splice(tagIndex, 1);
            spot.save();
        });

        Tag.findByIdAndRemove(tagId).exec((err, success) => {
            if (err) {
                return res.status(404).json({error: `Tag could not be deleted`});
            }

            res.json({message: 'Tag deleted'});
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (deleteTag)`});
    }
}