const Category = require('../models/categoryModel');
const Spot = require('../models/spotModel');



exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || name === '') {
            return res.status(400).json({error: `Name is required`});
        }
        
        const categoryExists = await Category.findOne({name: name.toLowerCase().trim()});
        if (categoryExists) {
            return res.status(400).json({error: 'Category with such name already exists'});
        }

        const createdCategory = await new Category({name: name.toLowerCase().trim(), description: description}).save();
        if (!createdCategory) {
            return res.status(500).json({error: `Category couldn't be saved`});
        }

        res.json(createdCategory);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (createCategory)`})
    }
}



exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort([['name', 'asc']]);
        if (!categories) {
            return res.status(404).json({error: `No categories could be found`});
        }

        res.json(categories);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getCategories)`})
    }
}



exports.getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId) {
            return res.status(400).json({error: `categoryId is required`});
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({error: `Category could not be found`});
        }

        res.json(category);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getCategoryByid)`});
    }
}



exports.editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId) {
            console.log('categoryId problem') //
            return res.status(400).json({error: `categoryId is required`});
        }

        const { name, description } = req.body;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({error: `Category not found`});
        }

        //protect urban, rustic, outdoors categories
        if (category.name === 'urban' || category.name === 'rustic' || category.name === 'outdoors') {
            return res.status(401).json({error: `urban, rustic, and outdoors categories are an integral part of the app and may not be altered`});
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, {name, description}, {new: true});
        if (!updatedCategory) {
            return res.status(500).json({error: `Categoty update failed`});
        }

        res.json(updatedCategory);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (editCategory)`});
    }
}



exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId) {
            return res.status(400).json({error: `categoryId is required`});
        }

        //protect urban, rustic, outdoors categories
        const category = await Category.findById(categoryId);
        if (category.name === 'urban' || category.name === 'rustic' || category.name === 'outdoors') {
            return res.status(401).json({error: `urban, rustic, and outdoors categories are an integral part of the app and may not be deleted`})
        }

        //delete Spots in the category
        await Spot.deleteMany({category: categoryId});

        Category.findByIdAndRemove(categoryId).exec((err, success) => {
            if (err) {
                return res.status(404).json({error: `Category could not be deleted`});
            }

            res.json({message: 'Category and spots in the category deleted'});
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (deleteCategory)`});
    }
}