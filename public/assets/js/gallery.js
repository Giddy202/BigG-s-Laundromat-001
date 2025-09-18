/**
 * Gallery Management System
 * Automatically loads and displays images from gallery folders
 */

class GalleryManager {
    constructor() {
        this.galleryContainer = document.getElementById('gallery-container');
        this.imageFolders = [
            'laundry',
            'upholstery', 
            'hotels',
            'auto',
            'equipment'
        ];
        this.loadedImages = [];
    }

    init() {
        // Don't override the HTML gallery - let it display as is
        // The HTML already has the gallery structure with images
        console.log('Gallery initialized - HTML gallery will display');
    }

    async loadGalleryImages() {
        // This method is called by the button but we don't need it
        // since the HTML gallery is already set up
        console.log('Gallery images are already loaded in HTML');
    }

    showPlaceholder() {
        if (this.galleryContainer) {
            this.galleryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="gallery-placeholder">
                        <i class="fas fa-images fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Gallery Images</h5>
                        <p class="text-muted">Add your images to the gallery folders to see them here</p>
                        <div class="row mt-4">
                            <div class="col-md-6">
                                <h6 class="text-muted">Image Folders:</h6>
                                <ul class="list-unstyled text-start">
                                    <li><code>laundry/</code> - Laundry service images</li>
                                    <li><code>upholstery/</code> - Upholstery cleaning images</li>
                                    <li><code>hotels/</code> - Hotel & office cleaning images</li>
                                    <li><code>auto/</code> - Auto detailing images</li>
                                    <li><code>equipment/</code> - Professional equipment images</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-muted">Image Requirements:</h6>
                                <ul class="list-unstyled text-start">
                                    <li>• Format: JPG or PNG</li>
                                    <li>• Size: 1000x750 pixels</li>
                                    <li>• File size: Under 500KB</li>
                                    <li>• Use descriptive names</li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-4">
                            <small class="text-muted">
                                <strong>Path:</strong> <code>public/assets/images/gallery/</code>
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showError() {
        if (this.galleryContainer) {
            this.galleryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="gallery-placeholder">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h5 class="text-muted">Gallery Loading Error</h5>
                        <p class="text-muted">Unable to load gallery images. Please check the image folders.</p>
                    </div>
                </div>
            `;
        }
    }

    // Method to manually add images (for when you have images)
    addImage(imagePath, title, description, category) {
        const imageHtml = `
            <div class="col-lg-4 col-md-6">
                <div class="gallery-item">
                    <div class="gallery-image">
                        <img src="${imagePath}" alt="${title}" class="img-fluid">
                        <div class="gallery-overlay">
                            <h5>${title}</h5>
                            <p>${description}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (this.galleryContainer) {
            // Remove placeholder if it exists
            const placeholder = this.galleryContainer.querySelector('.gallery-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            this.galleryContainer.insertAdjacentHTML('beforeend', imageHtml);
        }
    }

    // Method to load images from a specific folder
    loadImagesFromFolder(folderName, images) {
        images.forEach((image, index) => {
            const imagePath = `assets/images/gallery/${folderName}/${image}`;
            const title = this.getImageTitle(folderName, index);
            const description = this.getImageDescription(folderName);
            
            this.addImage(imagePath, title, description, folderName);
        });
    }

    getImageTitle(folderName, index) {
        const titles = {
            'laundry': ['Laundry Service', 'Dry Cleaning', 'Garment Care', 'Professional Laundry'],
            'upholstery': ['Upholstery Cleaning', 'Furniture Care', 'Deep Cleaning', 'Home Cleaning'],
            'hotels': ['Hotel Cleaning', 'Office Cleaning', 'Commercial Service', 'Business Cleaning'],
            'auto': ['Auto Detailing', 'Car Washing', 'Vehicle Care', 'Professional Detailing'],
            'equipment': ['Professional Equipment', 'Modern Technology', 'Cleaning Machines', 'Facility Equipment']
        };
        
        const categoryTitles = titles[folderName] || ['Gallery Image'];
        return categoryTitles[index % categoryTitles.length];
    }

    getImageDescription(folderName) {
        const descriptions = {
            'laundry': 'Professional garment care',
            'upholstery': 'Deep cleaning services',
            'hotels': 'Commercial cleaning',
            'auto': 'Vehicle cleaning services',
            'equipment': 'State-of-the-art facilities'
        };
        
        return descriptions[folderName] || 'Quality service';
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const galleryManager = new GalleryManager();
    galleryManager.init();
    
    // Make it globally available for manual image addition
    window.galleryManager = galleryManager;
});
