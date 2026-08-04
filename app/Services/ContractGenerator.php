<?php

namespace App\Services;

use App\Models\Assignment;

if (!class_exists('TCPDF')) {
    require_once base_path('vendor/tecnickcom/tcpdf/tcpdf.php');
}
use TCPDF;

/**
 * ContractGenerator
 *
 * Requires: composer require tecnickcom/tcpdf
 *
 * Generates a professional, branded PDF contract for a given Assignment.
 * Returns raw PDF bytes — caller decides whether to stream, store, or base64-encode.
 *
 * Usage:
 *   $pdf = (new ContractGenerator())->generate($assignment);
 *   return response($pdf, 200, ['Content-Type' => 'application/pdf']);
 */
class ContractGenerator
{
    // ── Brand palette (RGB) ──────────────────────────────────────────────────
    private const NAVY        = [13,  31,  60];
    private const GOLD        = [201, 168, 76];
    private const GOLD_LIGHT  = [245, 237, 214];
    private const SECTION_BG  = [248, 246, 241];
    private const WHITE       = [255, 255, 255];
    private const TEXT_DARK   = [26,  26,  26];
    private const TEXT_MID    = [68,  68,  68];
    private const TEXT_LIGHT  = [119, 119, 119];
    private const RULE_GRAY   = [204, 204, 204];

    // ── Layout constants (mm) ────────────────────────────────────────────────
    private const ML = 20;   // margin left
    private const MR = 20;   // margin right
    private const MT = 38;   // margin top (below header area)
    private const MB = 24;   // margin bottom (above footer bar)

    private TCPDF $pdf;
    private float $contentW;

    // ── Public entry point ───────────────────────────────────────────────────

    public function generate(Assignment $assignment): string
    {
        $assignment->loadMissing(['client.project', 'profile.project']);

        $client  = $assignment->client;
        $profile = $assignment->profile;
        // Get the project from either the client or the profile
        $project = $client->project ?? $profile->project;

        // Automatically resolve the project name
        $projectName = $project ? trim($project->name) : trim($client->c_fonction_source ?? '');
        $projectNameUpper = strtoupper($projectName);
        
        $isLallaDomi = in_array($projectNameUpper, ['LALLA_LGHALIA', 'LALLA LGHALIA', 'DOMICARE', 'DOMI CARE', 'DOMI_CARE'], true);
        $isAnnex     = in_array($projectNameUpper, ['LALLA_LGHALIA', 'LALLA LGHALIA', 'NOUNOU_DABA', 'NOUNOU DABA', 'NOUNOUDABA'], true);
        $isDomicare  = in_array($projectNameUpper, ['DOMICARE', 'DOMI CARE', 'DOMI_CARE'], true);
        
        $guarantee   = $isLallaDomi ? '6' : '3';
        $reference   = 'LPS/' . str_pad((string) $client->id, 4, '0', STR_PAD_LEFT) . '/' . date('Y');
        $statusMap   = ['completed' => 'Terminé', 'cancelled' => 'Annulé'];
        $statusStr   = $statusMap[$assignment->status] ?? 'Actif';
        $today       = date('d/m/Y');

        $logoPath = public_path('images/logo.png');
        $signPath = public_path('images/lvj_sign.png');
        $hasLogo  = file_exists($logoPath);
        $hasSign  = file_exists($signPath);

        // ── TCPDF init ───────────────────────────────────────────────────────
        $this->pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $this->pdf->SetCreator('LA VOIEJOB SARL');
        $this->pdf->SetAuthor('LA VOIEJOB SARL');
        $this->pdf->SetTitle('Protocole de Prestation — ' . $reference);
        $this->pdf->SetSubject($reference);
        $this->pdf->setPrintHeader(false);
        $this->pdf->setPrintFooter(false);
        $this->pdf->SetMargins(self::ML, self::MT, self::MR);
        $this->pdf->SetAutoPageBreak(true, self::MB + 6);
        $this->pdf->SetFont('helvetica', '', 9);

        $this->contentW = 210 - self::ML - self::MR; // A4 width - margins

        // ── Page 1 ───────────────────────────────────────────────────────────
        $this->pdf->AddPage();
        $this->drawChrome($reference, $today);

        if ($hasLogo) {
            // Place the logo cleanly at the top left, aligned with the margin
            $this->pdf->Image($logoPath, self::ML, 10, 45, '', '', '', '', false, 300);
        }

        $this->pdf->SetY(self::MT);

        // Title banner
        $this->titleBanner(
            $projectName ? 'Protocole de Prestation — ' . $projectName : 'Protocole de Prestation de Placement',
            $statusStr . '  ·  Réf : ' . $reference . '  ·  ' . $today
        );

        $this->spacer(5);

        // À l'attention de
        $this->pdf->SetFont('helvetica', 'B', 9);
        $this->setColor('fill', self::WHITE);
        $this->setColor('text', self::NAVY);
        $this->pdf->Cell($this->contentW, 6, 'À l\'attention de :', 0, 1, 'C');

        if ($isLallaDomi) {
            $attn = '<b>' . $client->c_nom . '</b>, de nationalité ' . ($client->c_nationalite ?? 'Marocaine') .
                ', titulaire de la CIN n° <b>' . $client->c_cin . '</b> valable jusqu\'au ' .
                ($client->c_cin_v ? date('d/m/Y', strtotime($client->c_cin_v)) : 'N/A') .
                ', demeurant à ' . $client->c_adresse_cin . '.';
        } else {
            $attn = '<b>' . $client->c_nom . '</b>, située à ' . $client->c_adresse_act .
                ', immatriculée au ICE n° <b>' . $client->c_cin . '</b>, représentée par <b>' .
                $client->c_responsable . '</b>, en sa qualité de responsable du ' . $client->c_logement . '.';
        }
        $this->pdf->SetFont('helvetica', '', 9);
        $this->setColor('text', self::TEXT_DARK);
        $this->pdf->writeHTMLCell($this->contentW, 0, self::ML, null, $attn, 0, 1, false, true, 'C');

        $this->spacer(3);
        $this->goldRule();
        $this->spacer(3);

        // ── Objet ────────────────────────────────────────────────────────────
        $displayProject = $projectName ?: 'Placement de Personnel';
        
        if ($isDomicare) {
            $objetTitle = 'Objet : Confirmation de la prestation de mise en relation — ' . $displayProject;
            $objetBody  = 'Faisant suite à votre demande de services de soins à domicile, nous vous confirmons notre intervention de mise en relation ainsi que les conditions et modalités de la prestation proposée.';
        } else {
            $objetTitle = 'Objet : Confirmation de la Prestation de Service — ' . $displayProject;
            $objetBody  = 'Nous faisons suite à votre demande concernant le placement d\'un personnel à votre service, et avons le plaisir de vous confirmer par la présente les conditions et modalités de notre intervention.';
        }

        $this->sectionBanner('i', $objetTitle);
        $this->spacer(2);
        $this->bodyText($objetBody);
        $this->spacer(2);
        $this->bodyText(
            '<b>LA VOIEJOB SARL</b>, cabinet spécialisé dans le recrutement et le placement de personnel, ' .
            'immatriculée au Registre du Commerce du Tribunal de Commerce de Tanger sous le numéro <b>143671</b>, ' .
            'propose un service de mise en relation entre employeurs et candidats qualifiés, à travers un processus ' .
            'de sélection rigoureux et encadré. Nous intervenons en tant que prestataire de service, sans lien ' .
            'contractuel avec les personnes recrutées.'
        );

        $this->spacer(4);

        // ── Section 1 : Profil ───────────────────────────────────────────────
        $this->sectionBanner('1', 'Informations sur le profil placé');
        $this->spacer(2);

        $cinV     = $profile->cin_validity_date ? date('d/m/Y', strtotime($profile->cin_validity_date)) : 'N/A';
        $birth    = $profile->birth_date        ? date('d/m/Y', strtotime($profile->birth_date))        : 'N/A';

        $rows = [
            ['Projet Affilié',    $projectName ?: 'Non spécifié'],
            ['Nom complet',       $profile->full_name],
            ['Matricule',         (string) $profile->id],
            ['Nationalité',       $profile->nationality ?? 'Marocaine'],
            ['CIN / Validité',    $profile->cin . '  ·  valable jusqu\'au ' . $cinV],
            ['Date de naissance', $birth . '  ·  ' . ($profile->birth_city ?? 'N/A')],
            ['Adresse',           $profile->cin_address ?? 'N/A'],
            ['Poste proposé',     str_replace('_', ' ', $profile->job) . ', ' . ($assignment->employment_type ?? '')],
            ['Lieu de travail',   $client->c_adresse_act],
        ];

        if ($isLallaDomi) {
            $rows[] = [
                'Rémunération',
                number_format($assignment->agreed_price ?? 0, 0, ',', ' ') . ',00 Dhs ' .
                ($assignment->payment_schedule ?? '') . ' — versée directement par vos soins.'
            ];
        }

        $this->infoGrid($rows);
        $this->spacer(4);

        // ── Section 2 : Nature de la prestation ─────────────────────────────
        $this->sectionBanner('2', 'Nature de la prestation de LA VOIEJOB');
        $this->spacer(2);
        $this->bodyText('Notre rôle se limite à :');
        $this->bulletItem('La compréhension de votre besoin en termes de profil ;');
        $this->bulletItem('La présélection et l\'évaluation des candidats selon les critères définis (expérience, sérieux, références) ;');
        $this->bulletItem('La présentation de profils qualifiés pour entretien ;');
        $this->bulletItem('L\'accompagnement jusqu\'à la mise en poste du candidat retenu.');
        $this->spacer(2);
        $this->bodyText(
            '<b>Important :</b> Nous agissons uniquement en tant qu\'intermédiaire. ' .
            'La personne recrutée devient votre employée directe et vous êtes son seul employeur légal et hiérarchique.'
        );

        $this->spacer(4);

        // ── Section 3 : Honoraires ───────────────────────────────────────────
        $this->sectionBanner('3', 'Honoraires de prestation');
        $this->spacer(2);

        $ribLine = $isLallaDomi ? '  ·  RIB : 230640 561964022101180019' : '';
        $this->infoGrid([
            ['Montant TTC',           number_format($client->c_prix_max ?? 0, 0, ',', ' ') . ',00 Dhs'],
            ['Modalités de paiement', 'Virement bancaire, espèces ou chèque.' . $ribLine],
            ['Échéance',              'Intégralement avant l\'entrée en fonction du profil placé.'],
        ]);

        $this->spacer(4);

        // ── Section 4 : Garantie ─────────────────────────────────────────────
        $this->sectionBanner('4', 'Garantie de remplacement');
        $this->spacer(2);
        $this->bodyText(
            'En cas de rupture de la relation avec le profil placé, pour quelque motif que ce soit ' .
            '(incompatibilité, désistement, manquement professionnel), <b>LA VOIEJOB s\'engage à ' .
            'effectuer un remplacement sans frais</b>, selon les modalités suivantes :'
        );
        $this->spacer(2);
        $this->infoGrid([
            ['Délai de remplacement', '72 heures ouvrables, hors jours fériés et week-ends.'],
            ['Durée de la garantie',  $guarantee . ' mois à compter de la date de signature du présent protocole.'],
        ]);

        $this->spacer(4);

        // ── Section 5 : Non-remboursement ────────────────────────────────────
        $this->sectionBanner('5', 'Clause de non-remboursement');
        $this->spacer(2);
        $this->bodyText(
            'Les frais de prestation sont <b>ni remboursables ni transférables</b>, quelle que soit ' .
            'la situation ultérieure (départ volontaire du personnel, changement de besoin, etc.).'
        );

        $this->spacer(4);

        // ── Section 6 : Confidentialité ──────────────────────────────────────
        $this->sectionBanner('6', 'Engagement de confidentialité');
        $this->spacer(2);
        $this->bodyText(
            'Toutes les informations échangées dans le cadre de cette mission sont strictement confidentielles. ' .
            '<b>LA VOIEJOB</b> s\'engage à ne transmettre à aucun tiers, sans votre autorisation écrite préalable, ' .
            'les données personnelles vous concernant.'
        );

        $this->spacer(5);
        $this->bodyText(
            'Nous vous remercions de la confiance que vous nous accordez et demeurons à votre entière disposition ' .
            'pour tout complément d\'information.'
        );

        $this->spacer(4);
        $this->goldRule();
        $this->spacer(4);

        // Date
        $this->pdf->SetFont('helvetica', '', 9);
        $this->setColor('text', self::TEXT_MID);
        $this->pdf->Cell($this->contentW, 5, 'Fait à Tanger, le ' . $today, 0, 1, 'R');
        $this->spacer(4);

        // ── Signature block ──────────────────────────────────────────────────
        $this->signatureBlock($client->c_nom, $hasSign ? $signPath : null);

        // ── Annex ────────────────────────────────────────────────────────────
        if ($isAnnex) {
            $this->pdf->AddPage();
            $this->drawChrome($reference, $today);
        if ($hasLogo) {
            $this->pdf->Image($logoPath, self::ML, 10, 45, '', '', '', '', false, 300);
        }

        $this->pdf->SetY(self::MT);

            $this->pdf->SetFont('helvetica', 'B', 10);
            $this->setColor('text', self::NAVY);
            $this->pdf->Cell($this->contentW, 7, 'Annexe : Guide pratique — Loi des travailleurs domestiques N° 19-12', 0, 1, 'L');
            $this->goldRule();
            $this->spacer(3);

            $annexItems = [
                ['Art. 01', 'La loi 19-12 exige la formalisation du contrat de travail par écrit, conformément au contrat-type prévu par le décret du Chef du Gouvernement du 31/08/2017. Le contrat, dont les signatures doivent être légalisées, est établi en trois exemplaires : un pour le travailleur, un déposé auprès de l\'inspection du travail, et un pour l\'employeur. Le contrat est exonéré des droits d\'enregistrement.'],
                ['Art. 02', 'L\'employeur n\'est pas autorisé à transférer le profil à un membre de sa famille.'],
                ['Art. 03', 'Les travailleurs domestiques ne font pas partie du personnel de la société.'],
                ['Art. 04', 'La durée de travail hebdomadaire est fixée à 48 heures, répartie sur les jours de la semaine d\'un commun accord entre les parties. La moyenne quotidienne est de 8 heures par jour.'],
                ['Art. 05', 'Les travailleurs domestiques bénéficient d\'un jour de repos hebdomadaire d\'une durée minimale de vingt-quatre (24) heures consécutives.'],
                ['Art. 06', 'Les travailleurs domestiques bénéficient d\'un repos payé pendant les jours de fêtes religieuses. Ces jours peuvent être reportés à une date ultérieure fixée d\'un commun accord entre les deux parties.'],
            ];

            foreach ($annexItems as $i => [$num, $text]) {
                $bg = ($i % 2 === 0) ? self::SECTION_BG : self::WHITE;
                $y  = $this->pdf->GetY();

                // Badge cell
                $this->pdf->SetFillColor(...self::NAVY);
                $this->pdf->SetTextColor(...self::WHITE);
                $this->pdf->SetFont('helvetica', 'B', 8);
                $this->pdf->MultiCell(18, 0, $num, 0, 'C', true, 0, self::ML, $y, true, 0, false, true, 0, 'M');

                // Text cell
                $this->pdf->SetFillColor(...$bg);
                $this->pdf->SetTextColor(...self::TEXT_DARK);
                $this->pdf->SetFont('helvetica', '', 8.5);
                $this->pdf->MultiCell($this->contentW - 18, 0, $text, 0, 'J', true, 1, self::ML + 18, $y, true, 0, false, true, 0, 'T');

                // Bottom border
                $rowH  = $this->pdf->GetY() - $y;
                $this->pdf->SetDrawColor(...self::RULE_GRAY);
                $this->pdf->Line(self::ML, $this->pdf->GetY(), self::ML + $this->contentW, $this->pdf->GetY());
            }
        }

        return $this->pdf->Output('contract.pdf', 'S');
    }

    // ── Chrome: footer bar + watermark (Top bar removed for cleaner logo) ────

    private function drawChrome(string $reference, string $date): void
    {
        $pdf = $this->pdf;
        
        // Disable auto page break to draw footer safely
        $autoPageBreak = $pdf->getAutoPageBreak();
        $bMargin = $pdf->getBreakMargin();
        $pdf->SetAutoPageBreak(false, 0);

        // Reference right-aligned at the top, vertically aligned with the logo
        $pdf->SetFont('helvetica', '', 8.5);
        $pdf->SetTextColor(...self::TEXT_MID);
        $pdf->SetXY(0, 16);
        $pdf->Cell(210 - self::MR, 5, 'Réf : ' . $reference . '  ·  ' . $date, 0, 0, 'R');

        // Elegant letterhead separator line
        $pdf->SetDrawColor(...self::RULE_GRAY);
        $pdf->SetLineWidth(0.3);
        $pdf->Line(self::ML, 30, 210 - self::MR, 30);
        $pdf->SetDrawColor(...self::GOLD);
        $pdf->SetLineWidth(0.8);
        $pdf->Line(self::ML, 30.5, self::ML + 15, 30.5); // Small gold accent line

        // Footer bar (navy)
        $pdf->SetFillColor(...self::NAVY);
        $pdf->Rect(0, 285, 210, 12, 'F');

        // Gold accent above footer
        $pdf->SetFillColor(...self::GOLD);
        $pdf->Rect(0, 284.5, 210, 0.8, 'F');

        // Footer text
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetTextColor(...self::WHITE);
        $pdf->SetXY(self::ML, 287.5);
        $pdf->Cell(120, 4, 'Residence Chaouia Av. Youssef Ibn Tachfine, Rue Rachid Reda 4ème Étg N°21, Tanger  ·  RC : 143671', 0, 0, 'L');
        $pdf->SetXY(0, 287.5);
        $pdf->Cell(210 - self::MR, 4, 'contact@lavoiejob.ma  ·  www.lavoiejob.ma', 0, 0, 'R');
        $pdf->SetXY(0, 291.5);
        $pdf->Cell(210, 4, 'Page ' . $pdf->getPage(), 0, 0, 'C');

        // Diagonal watermark
        $pdf->StartTransform();
        $pdf->SetAlpha(0.08); // Increased opacity slightly for a more premium look
        $pdf->SetFont('helvetica', 'B', 48); // Slightly larger
        $pdf->SetTextColor(...self::GOLD);
        $pdf->SetXY(0, 0);
        $pdf->StartTransform();
        $pdf->Rotate(45, 105, 148);
        $pdf->Text(105, 148, 'AGENCE LAVOIEJOB');
        $pdf->StopTransform();
        $pdf->SetAlpha(1);
        $pdf->StopTransform();

        // Reset text color and auto page break
        $pdf->SetTextColor(...self::TEXT_DARK);
        $pdf->SetAutoPageBreak($autoPageBreak, $bMargin);
    }

    // ── Title banner ─────────────────────────────────────────────────────────

    private function titleBanner(string $title, string $subtitle): void
    {
        $pdf = $this->pdf;
        $y   = $pdf->GetY();

        // Navy background
        $pdf->SetFillColor(...self::NAVY);
        $pdf->Rect(self::ML, $y, $this->contentW, 18, 'F');

        // Gold bottom accent
        $pdf->SetFillColor(...self::GOLD);
        $pdf->Rect(self::ML, $y + 18, $this->contentW, 2, 'F');

        $pdf->SetFont('helvetica', 'B', 13);
        $pdf->SetTextColor(...self::WHITE);
        $pdf->SetXY(self::ML, $y + 2);
        $pdf->Cell($this->contentW, 8, $title, 0, 1, 'C');

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(...self::GOLD);
        $pdf->SetX(self::ML);
        $pdf->Cell($this->contentW, 6, $subtitle, 0, 1, 'C');

        $pdf->SetTextColor(...self::TEXT_DARK);
        $pdf->SetY($y + 22);
    }

    // ── Section banner ────────────────────────────────────────────────────────

    private function sectionBanner(string $number, string $title): void
    {
        $pdf = $this->pdf;
        
        // Prevent awkward page breaks by checking if we have enough space (25mm)
        if ($pdf->GetY() > ($pdf->getPageHeight() - self::MB - 25)) {
            $pdf->AddPage();
            // Since we override Header/Footer, we need to redraw chrome manually if there is a way to get reference and today.
            // But we don't have reference/today in this scope. So we will rely on TCPDF's auto page break not splitting the banner itself.
            // Actually, we can temporarily disable auto page break just for the banner to force it to stay together!
        }
        
        // Force banner to stay on the same page even if it's tight
        $autoPageBreak = $pdf->getAutoPageBreak();
        $pdf->SetAutoPageBreak(false);

        $y   = $pdf->GetY();

        // Gold badge
        $pdf->SetFillColor(...self::GOLD);
        $pdf->Rect(self::ML, $y, 9, 8, 'F');

        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(...self::NAVY);
        $pdf->SetXY(self::ML, $y + 0.5);
        $pdf->Cell(9, 7, $number, 0, 0, 'C');

        // Navy title area
        $pdf->SetFillColor(...self::NAVY);
        $pdf->Rect(self::ML + 9, $y, $this->contentW - 9, 8, 'F');

        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(...self::WHITE);
        $pdf->SetXY(self::ML + 12, $y + 0.5);
        $pdf->Cell($this->contentW - 12, 7, $title, 0, 1, 'L');

        $pdf->SetTextColor(...self::TEXT_DARK);
        
        // Restore page break and move Y down properly
        $pdf->SetAutoPageBreak($autoPageBreak, self::MB + 6);
        $pdf->SetY($y + 8);
    }

    // ── Info grid ─────────────────────────────────────────────────────────────

    private function infoGrid(array $rows): void
    {
        $pdf  = $this->pdf;
        $colW = $this->contentW / 2;

        foreach ($rows as $i => [$label, $value]) {
            $value = (string) ($value ?? '-');
            $bg = ($i % 2 === 0) ? self::SECTION_BG : self::WHITE;
            $y  = $pdf->GetY();

            // Measure height needed for value (may wrap)
            $pdf->SetFont('helvetica', '', 8.5);
            $lineCount = max(1, (int) ceil(mb_strlen($value) / 55));
            $cellH     = max(7, $lineCount * 4.5 + 3);

            // Label cell
            $pdf->SetFillColor(...self::SECTION_BG);
            $pdf->SetTextColor(...self::NAVY);
            $pdf->SetFont('helvetica', 'B', 8.5);
            $pdf->MultiCell($colW, $cellH, $label, 0, 'L', true, 0, self::ML, $y, true, 0, false, true, $cellH, 'M');

            // Value cell
            $pdf->SetFillColor(...$bg);
            $pdf->SetTextColor(...self::TEXT_DARK);
            $pdf->SetFont('helvetica', '', 8.5);
            $pdf->MultiCell($colW, $cellH, $value, 0, 'L', true, 1, self::ML + $colW, $y, true, 0, false, true, $cellH, 'M');

            // Bottom rule
            $pdf->SetDrawColor(...self::RULE_GRAY);
            $pdf->Line(self::ML, $pdf->GetY(), self::ML + $this->contentW, $pdf->GetY());
        }

        // Gold border around entire grid
        $pdf->SetDrawColor(...self::GOLD);
        // Drawn implicitly by cells; explicit box skipped to avoid TCPDF layering artifacts.

        $pdf->SetTextColor(...self::TEXT_DARK);
    }

    // ── Signature block ───────────────────────────────────────────────────────

    private function signatureBlock(string $clientName, ?string $signPath): void
    {
        $pdf  = $this->pdf;
        $colW = $this->contentW / 2;
        $y    = $pdf->GetY();
        $h    = 45;

        // Background
        $pdf->SetFillColor(...self::SECTION_BG);
        $pdf->Rect(self::ML, $y, $this->contentW, $h, 'F');

        // Outer border
        $pdf->SetDrawColor(...self::RULE_GRAY);
        $pdf->Rect(self::ML, $y, $this->contentW, $h, 'D');

        // Divider
        $pdf->Line(self::ML + $colW, $y, self::ML + $colW, $y + $h);

        // ── Agency side ──────────────────────────────────────────────────────
        $pdf->SetFont('helvetica', 'B', 8.5);
        $pdf->SetTextColor(...self::NAVY);
        $pdf->SetXY(self::ML + 3, $y + 3);
        $pdf->Cell($colW - 6, 5, 'Pour LA VOIEJOB SARL', 0, 1, 'L');

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(...self::TEXT_MID);
        $pdf->SetX(self::ML + 3);
        $pdf->Cell($colW - 6, 4, 'Directeur / Représentant légal', 0, 1, 'L');

        if ($signPath) {
            $pdf->Image($signPath, self::ML + 5, $y + 12, 50, 18, '', '', '', false, 300);
        }

        // Signature line
        $pdf->SetDrawColor(...self::NAVY);
        $pdf->Line(self::ML + 4, $y + $h - 9, self::ML + $colW - 4, $y + $h - 9);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetTextColor(...self::TEXT_LIGHT);
        $pdf->SetXY(self::ML + 4, $y + $h - 8);
        $pdf->Cell($colW - 8, 4, 'Cachet et signature', 0, 0, 'C');

        // ── Client side ──────────────────────────────────────────────────────
        $pdf->SetFont('helvetica', 'B', 8.5);
        $pdf->SetTextColor(...self::NAVY);
        $pdf->SetXY(self::ML + $colW + 3, $y + 3);
        $pdf->Cell($colW - 6, 5, 'Le Client', 0, 1, 'L');

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(...self::TEXT_MID);
        $pdf->SetX(self::ML + $colW + 3);
        $pdf->Cell($colW - 6, 4, $clientName, 0, 1, 'L');

        // Signature line
        $pdf->SetDrawColor(...self::NAVY);
        $pdf->Line(self::ML + $colW + 4, $y + $h - 9, self::ML + $this->contentW - 4, $y + $h - 9);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetTextColor(...self::TEXT_LIGHT);
        $pdf->SetXY(self::ML + $colW + 4, $y + $h - 8);
        $pdf->Cell($colW - 8, 4, 'Signature précédée de « Lu et approuvé »', 0, 0, 'C');

        $pdf->SetY($y + $h + 2);
        $pdf->SetTextColor(...self::TEXT_DARK);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function bodyText(string $html): void
    {
        $this->pdf->SetFont('helvetica', '', 9);
        $this->setColor('text', self::TEXT_DARK);
        $this->pdf->writeHTMLCell($this->contentW, 0, self::ML, null, $html, 0, 1, false, true, 'J');
    }

    private function bulletItem(string $text): void
    {
        $this->pdf->SetFont('helvetica', '', 9);
        $this->setColor('text', self::TEXT_DARK);
        $x = $this->pdf->GetX();
        $y = $this->pdf->GetY();
        $this->pdf->SetXY(self::ML + 4, $y);

        // Gold bullet
        $this->setColor('text', self::GOLD);
        $this->pdf->Cell(4, 5, '•', 0, 0, 'L');
        $this->setColor('text', self::TEXT_DARK);
        $this->pdf->writeHTMLCell($this->contentW - 8, 0, self::ML + 8, null, $text, 0, 1, false, true, 'J');
    }

    private function goldRule(): void
    {
        $y = $this->pdf->GetY();
        $this->pdf->SetDrawColor(...self::GOLD);
        $this->pdf->SetLineWidth(0.8);
        $this->pdf->Line(self::ML, $y, self::ML + $this->contentW, $y);
        $this->pdf->SetLineWidth(0.2);
        $this->pdf->SetDrawColor(...self::RULE_GRAY);
    }

    private function spacer(float $mm): void
    {
        $this->pdf->SetY($this->pdf->GetY() + $mm);
    }

    private function setColor(string $type, array $rgb): void
    {
        match ($type) {
            'fill' => $this->pdf->SetFillColor(...$rgb),
            'text' => $this->pdf->SetTextColor(...$rgb),
            'draw' => $this->pdf->SetDrawColor(...$rgb),
        };
    }
}
