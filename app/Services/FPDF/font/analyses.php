
<style>
    :root {
        --primary: #ffc107;
        --primary-dark: #f9a825;
        --text-dark: #2c3e50;
        --text-medium: #34495e;
        --bg-light: #fafafa;
        --white: #ffffff;
    }

    .expertise-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        max-width: 1400px;
        margin: 2rem auto;
    }

    .expertise-card {
        height: 400px;
        position: relative;
        transition: transform 0.3s ease;
    }

    .expertise-card:hover {
        transform: translateY(-8px);
    }

    .card-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        padding: 0;
        background: var(--bg-light);
        border: 1px solid rgba(0,0,0,0.05);
        border-radius: 20px;
        text-decoration: none;
        height: 100%;
        color: var(--text-dark);
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
    }

    .card-link:hover {
        background: var(--white);
        box-shadow: 0 20px 40px rgba(255,193,7,0.25);
        border-color: var(--primary);
    }

    .number-icon {
        position: absolute;
        top: 1.5rem;
        right: 2rem;
        font-size: 5rem;
        font-weight: 900;
        color: rgba(255,193,7,0.2);
        line-height: 1;
        transition: all 0.4s ease;
        z-index: 2;
    }

    .card-link:hover .number-icon {
        transform: scale(1.2) rotate(-10deg);
        color: rgba(255,193,7,0.4);
    }

    .project-logo {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 85%;
        object-fit: cover;
        transition: transform 0.6s ease;
        filter: brightness(0.95);
    }

    .card-link:hover .project-logo {
        transform: scale(1.08);
        filter: brightness(1.05);
    }

    .project-icon {
        font-size: 8rem;
        color: var(--text-medium);
        margin-bottom: 4rem;
        transition: transform 0.3s ease;
        z-index: 1;
        opacity: 0.1; /* Placeholder if no image */
    }

    .expertise-title {
        font-size: 1.4rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        text-align: center;
        color: var(--text-dark);
        width: 100%;
        padding: 1.5rem;
        background: white;
        position: relative;
        z-index: 2;
        height: 15%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-top: 1px solid rgba(0,0,0,0.05);
    }
    
    .page-title-custom {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }
    
    .page-subtitle-custom {
        font-size: 1.1rem;
        color: var(--text-medium);
        opacity: 0.7;
    }

</style>

<div class="page-wrapper">
    <div class="container-xl">
        <div class="page-header d-print-none mb-5">
            <div class="row align-items-center">
                <div class="col">
                    <h2 class="page-title-custom">
                        Data Analysis Dashboard
                    </h2>
                    <div class="page-subtitle-custom">
                        Sélectionnez un projet pour visualiser les statistiques détaillées
                    </div>
                </div>
            </div>
        </div>

        <div class="page-body">
            <div class="expertise-grid">
                
                <!-- Lalla Lghalia -->
                <div class="expertise-card">
                    <a href="<?=ROOT?>/system/analyses/lalla_lghalia" class="card-link">
                        <span class="number-icon">01</span>
                        <img src="<?=ROOT?>/assets/img/logos/lalla_lghalia.jpg" alt="Lalla Lghalia" class="project-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                        <i class="fa-solid fa-person-dress project-icon" style="display:none"></i>
                        <div class="expertise-title">Lalla Lghalia</div>
                    </a>
                </div>

                <!-- Pro Pro -->
                <div class="expertise-card">
                    <a href="<?=ROOT?>/system/analyses/pro_pro" class="card-link">
                        <span class="number-icon">02</span>
                        <img src="<?=ROOT?>/assets/img/logos/pro_pro.png" alt="Pro Pro" class="project-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                        <i class="fa-solid fa-user-tie project-icon" style="display:none"></i>
                        <div class="expertise-title">Pro Pro</div>
                    </a>
                </div>

                <!-- Yallah Nkhedmo -->
                <div class="expertise-card">
                    <a href="<?=ROOT?>/system/analyses/yallah_nkhedmo" class="card-link">
                        <span class="number-icon">03</span>
                        <img src="<?=ROOT?>/assets/img/logos/yallah_nkhedmo.png" alt="Yallah Nkhedmo" class="project-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                        <i class="fa-solid fa-briefcase project-icon" style="display:none"></i>
                        <div class="expertise-title">Yallah Nkhedmo</div>
                    </a>
                </div>

               
                    </a>
                </div>

            </div>
        </div>
    </div>
</div>
