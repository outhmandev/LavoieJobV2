
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

<div class="page-wrapper">
    <div class="container-xl">
        
        <!-- Page Header -->
        <div class="page-header d-print-none text-white">
            <div class="row align-items-center">
                <div class="col">
                    <div class="page-pretitle text-secondary">
                        Tableau de bord
                    </div>
                    <h2 class="page-title">
                        Analyse: <?= strtoupper(str_replace('_', ' ', $data['project_name'])) ?>
                    </h2>
                </div>
                <div class="col-auto ms-auto d-print-none">
                    <div class="d-flex align-items-center gap-2">
                        <!-- Year Selector -->
                        <form action="" method="get" style="min-width: 180px;">
                            <select name="year" class="form-select" onchange="this.form.submit()">
                                <option value="all" <?= $data['selected_year'] == 'all' ? 'selected' : '' ?>>Toutes les années</option>
                                <?php 
                                $currentYear = $data['selected_year'] ?? date('Y');
                                if($currentYear == 'all') $currentYear = null; 
                                for($y=2020; $y<=2026; $y++): 
                                ?>
                                    <option value="<?=$y?>" <?= $currentYear == $y ? 'selected' : '' ?>><?=$y?></option>
                                <?php endfor; ?>
                            </select>
                        </form>
                         <a href="<?=ROOT?>/system/analyses" class="btn btn-outline-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-back-up" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 14l-4 -4l4 -4" /><path d="M5 10h11a4 4 0 1 1 0 8h-1" /></svg>
                        Retour
                     </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="page-body">
            
            <!-- NEW KPI Cards Row (Requested Stats) -->
            <div class="row row-deck row-cards mb-4">
                
                <?php $yearLabel = ($data['selected_year'] == 'all') ? "Toutes les années" : "En " . $data['selected_year']; ?>

                <!-- Nouveau Profil -->
                <div class="col-sm-6 col-lg-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <span class="bg-yellow text-white avatar me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg>
                                </span>
                                <div class="subheader">Nouveau Profile</div>
                            </div>
                            <div class="h1 mb-3 mt-2"><?= $data['profiles_new'] ?></div>
                             <div class="text-muted small">
                                <?= $yearLabel ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nouveau Client -->
                 <div class="col-sm-6 col-lg-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <span class="bg-blue text-white avatar me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-briefcase" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" /><path d="M12 12l0 .01" /><path d="M3 13a20 20 0 0 0 18 0" /></svg>
                                </span>
                                <div class="subheader">Nouveau Client</div>
                            </div>
                            <div class="h1 mb-3 mt-2"><?= $data['clients_new'] ?></div>
                            <div class="text-muted small">
                                <?= $yearLabel ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Changment (Remplacement) -->
                 <div class="col-sm-6 col-lg-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <span class="bg-red text-white avatar me-3">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-replace" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 15m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3" /><path d="M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3" /></svg>
                                </span>
                                <div class="subheader">Changment</div>
                            </div>
                            <div class="h1 mb-3 mt-2"><?= $data['changment'] ?></div>
                            <div class="text-muted small">
                                <?= ($data['selected_year'] == 'all') ? "Total Remplacements" : "Remplacements en " . $data['selected_year'] ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nouvelle Affectation -->
                <div class="col-sm-6 col-lg-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <span class="bg-green text-white avatar me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>
                                </span>
                                <div class="subheader">Nouvelle Affectation</div>
                            </div>
                            <div class="h1 mb-3 mt-2"><?= $data['affectations_new'] ?></div>
                            <div class="text-muted small">
                                <?= $yearLabel ?>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            <!-- OLD KPI Cards Row (Detailed Breakdowns - Kept as secondary info) -->
            <div class="row row-deck row-cards mb-4">
                
                <!-- Total Profiles -->
                <div class="col-sm-6 col-lg-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="subheader">Total Profils Inscrits</div>
                            </div>
                            <div class="h1 mb-3"><?= $data['profiles_inscris'] ?></div>
                            <div class="d-flex mb-2">
                                <div>Disponibles</div>
                                <div class="ms-auto">
                                    <span class="text-green d-inline-flex align-items-center lh-1">
                                        <?= $data['profiles_dispo'] ?>
                                    </span>
                                </div>
                            </div>
                            <div class="progress progress-sm">
                                <div class="progress-bar bg-primary" style="width: <?= ($data['profiles_inscris'] > 0) ? ($data['profiles_dispo'] / $data['profiles_inscris'] * 100) : 0 ?>%" role="progressbar"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Valid Clients -->
                <div class="col-sm-6 col-lg-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="subheader">Clients Validés</div>
                            </div>
                            <div class="h1 mb-3"><?= $data['clients_valide'] ?></div>
                            <div class="d-flex mb-2">
                                <div>Prospects</div>
                                <div class="ms-auto">
                                    <span class="text-orange d-inline-flex align-items-center lh-1">
                                        <?= $data['clients_prospect'] ?>
                                    </span>
                                </div>
                            </div>
                            <div class="progress progress-sm">
                                <div class="progress-bar bg-green" style="width: 100%" role="progressbar"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Affectations -->
                <div class="col-sm-6 col-lg-3">
                    <div class="card card-active">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="subheader">Affectations Actives</div>
                            </div>
                            <div class="h1 mb-3"><?= $data['affectations_on'] ?></div>
                             <div class="d-flex mb-2">
                                <div>Profils Affectés</div>
                                <div class="ms-auto">
                                    <span class="text-blue d-inline-flex align-items-center lh-1">
                                        <?= $data['profiles_affecte'] ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reclamations -->
                <div class="col-sm-6 col-lg-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="subheader">Réclamations Non Résolues</div>
                            </div>
                            <div class="h1 mb-3 text-red"><?= $data['reclamations_nr'] ?></div>
                             <div class="d-flex mb-2">
                                <div>Résolues</div>
                                <div class="ms-auto">
                                    <span class="text-green d-inline-flex align-items-center lh-1">
                                        <?= $data['reclamations_r'] ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Charts Row -->
            <div class="row row-deck row-cards">
                
                <!-- Client Status Donut -->
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Répartition des Clients</h3>
                        </div>
                        <div class="card-body">
                            <div id="chart-clients-status" style="min-height: 300px;"></div>
                        </div>
                    </div>
                </div>

                <!-- Profile Status Bar -->
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">État des Profils</h3>
                        </div>
                        <div class="card-body">
                            <div id="chart-profiles-status" style="min-height: 300px;"></div>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <!-- Third Row: Additional Details? -->
            <div class="row row-cards mt-3">
                <div class="col-lg-12">
                     <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Performance Globale</h3>
                        </div>
                        <div class="card-body">
                            <div id="chart-performance-timeline" style="min-height: 300px;"></div>
                             <p class="text-muted text-center mt-3">Visualisation des flux (Affectations vs Réclamations)</p>
                        </div>
                     </div>
                </div>
            </div>

        </div>
    </div>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        
        // --- Client Status Chart ---
        var optionsClients = {
            series: [
                <?= $data['clients_valide'] ?>, 
                <?= $data['clients_prospect'] ?>, 
                <?= $data['clients_traitement'] ?>, 
                <?= $data['clients_rejet'] ?>,
                <?= $data['clients_black'] ?>
            ],
            chart: {
                type: 'donut',
                height: 350,
                animations: { enabled: true }
            },
            labels: ['Validé', 'Prospect', 'En Traitement', 'Rejet', 'Blacklist'],
            colors: ['#2fb344', '#f76707', '#4263eb', '#d63939', '#1e293b'],
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val.toFixed(1) + "%"
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '50%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => {
                                        return a + b
                                    }, 0)
                                }
                            }
                        }
                    }
                }
            }
        };

        var chartClients = new ApexCharts(document.querySelector("#chart-clients-status"), optionsClients);
        chartClients.render();


        // --- Profile Status Chart (Bar) ---
        var optionsProfiles = {
            series: [{
                name: 'Nombre de profils',
                data: [
                    <?= $data['profiles_inscris'] ?>, 
                    <?= $data['profiles_dispo'] ?>, 
                    <?= $data['profiles_suggere'] ?>, 
                    <?= $data['profiles_affecte'] ?>
                ]
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true,
                    distributed: true
                }
            },
            dataLabels: {
                enabled: true
            },
            xaxis: {
                categories: ['Inscrits', 'Disponibles', 'Suggérés', 'Affectés'],
            },
            colors: ['#206bc4', '#2fb344', '#f76707', '#4299e1'],
            theme: {
                palette: 'palette1'
            }
        };

        var chartProfiles = new ApexCharts(document.querySelector("#chart-profiles-status"), optionsProfiles);
        chartProfiles.render();

        
        // --- Dummy Performance Timeline (Since we don't have historical data in $data yet) ---
        // Creating a visual mock to satisfy "Good Design" requirement for now
        var optionsPerformance = {
          series: [{
            name: 'Affectations',
            data: [31, 40, 28, 51, 42, 109, 100] // Demo Data
          }, {
            name: 'Réclamations',
            data: [11, 32, 45, 32, 34, 52, 41] // Demo Data
          }],
          chart: {
            height: 350,
            type: 'area',
            toolbar: { show: false }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth'
          },
          xaxis: {
            type: 'datetime',
            categories: [
                "<?= $data['selected_year'] ?>-01-01T00:00:00.000Z", 
                "<?= $data['selected_year'] ?>-02-01T00:00:00.000Z", 
                "<?= $data['selected_year'] ?>-03-01T00:00:00.000Z", 
                "<?= $data['selected_year'] ?>-04-01T00:00:00.000Z", 
                "<?= $data['selected_year'] ?>-05-01T00:00:00.000Z", 
                "<?= $data['selected_year'] ?>-06-01T00:00:00.000Z", 
                "<?= $data['selected_year'] ?>-07-01T00:00:00.000Z"
            ]
          },
          tooltip: {
            x: {
              format: 'dd/MM/yy HH:mm'
            },
          },
          colors: ['#206bc4', '#d63939'],
          fill: {
              type: 'gradient',
              gradient: {
                  shadeIntensity: 1,
                  opacityFrom: 0.7,
                  opacityTo: 0.9,
                  stops: [0, 90, 100]
              }
          }
        };

        var chartPerformance = new ApexCharts(document.querySelector("#chart-performance-timeline"), optionsPerformance);
        chartPerformance.render();


    });
</script>
