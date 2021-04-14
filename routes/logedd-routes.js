const express = require('express');

const Place = require('../models/Place');
const User = require('../models/User');
const Review = require('../models/Review');

const router = express();


router.get('/dashboard', (req, res) => {
    res.render('dashboard');

});

router.get('/editUser', (req, res) => {
    const userInfos = req.session.currentUser;
    
    User.findById(userInfos._id)
    .then(userInfos => {
        res.render('editUser', { userInfos });
    })

    .catch(error => {
        return error;
    })
});

router.post('/editUser', (req, res) => {
    const updatedUser = req.body;

    const id = req.session.currentUser;

    User.findByIdAndUpdate(id, updatedUser)
    .then(() => {
        res.redirect('/dashboard')
    })

    .catch(error => {
        return error;
    })
});

router.post('/removeUser', (req,res) => {
    const id = req.session.currentUser;
   
    User.findByIdAndRemove(id)
    .then(() =>{
       res.redirect('/')
    })
    .catch(error => {
        console.log('Erro ao deletar usuário', error)
    })
});

router.get('/places/:category', async (req, res) => {
    const { category } = req.params;
    
    const placesFromDb =  await Place.find({ categoria: category })
    const reviewsFromDb = await Review.find()

    const placesWithReviewPromises = placesFromDb.map( async place => {
        const parsePlace = place.toJSON();
        const id = parsePlace._id
        
        const places = await Review.find({ lugar: id })
        const reviews = {...parsePlace, reviews: places}
        return reviews
        
    }); 

    const placesWithReview = await Promise.all(placesWithReviewPromises)
    
    console.log(placesWithReview)
    res.render('places', { placesWithReview })

    // console.log(reviewsFromDb)
})

router.post('/addReview/:id', async (req,res) => {
    const placeId = req.params;
    
    const { review } = req.body;

    try {
        const newReview = {
            lugar: placeId.id,
            desc: review,
            emissor: req.session.currentUser._id
        }
        await Review.create(newReview)
            .then(() => {
                res.render('dashboard')
            })
    } catch(error) {
        console.log(error)
    }    
})

router.get('/myReviews', (req, res) => {
    Review.find({ emissor: req.session.currentUser }).populate('lugar')   
        .then(myReviews => {
            res.render('myReviews', { myReviews })
        });
})


router.post('/myReviews/delete/:id', (req,res) => {
    const { id } = req.params;
    
    Review.findByIdAndRemove(id)
    .then(() =>{
       res.redirect('/myReviews')
    })
    .catch(error => {
        console.log('Erro ao deletar review', error)
    })
});

// router.post('/myReviews/edit/:id', (req, res) => {
    

// });


router.get('/addPlace', (req, res) => {
    res.render('addPlace')
}); 

// router.post('/addPlace', async (req, res) => {
//     const { newName, newAdress, newSite } = req.body;

//     try {
//         const placeFromDb = await Place.findOne({ nome: newName });
        
//         if (placeFromDb) {
//             return res.render('addPlace', { placeError: 'Lugar já cadastrado' }); 
//         }

//         const newPlace = {
//             nome: newName,
//             endereco: newAdress,
//             site: newSite,
//         }
       
//         await Place.create(newPlace);
        
//         res.redirect('/dashboard');


//     }catch (error) {
//         console.log('Erro ao adicionar novo lugar', error)
//     }
// });

module.exports = router;