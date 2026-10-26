from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.colors import HexColor
from PIL import Image as PILImage, ImageDraw, ImageFont

ROOT = Path(__file__).parent
ASSETS = ROOT / 'assets'
OUT = ROOT / 'Explainable_Temporal_Plant_Growth_Forecasting_Conference_Paper.pdf'
W,H=A4
GREEN=HexColor('#155E43'); PALE=HexColor('#E6F2EB'); GRAY=HexColor('#F3F5F4')

for name, path in [('Times',r'C:\Windows\Fonts\times.ttf'),('TimesB',r'C:\Windows\Fonts\timesbd.ttf'),('Arial',r'C:\Windows\Fonts\arial.ttf'),('ArialB',r'C:\Windows\Fonts\arialbd.ttf')]:
    pdfmetrics.registerFont(TTFont(name,path))

def draw_architecture():
    im=PILImage.new('RGB',(1600,700),'white');d=ImageDraw.Draw(im); f=ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf',24); s=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',20)
    boxes=[('React\ndashboard',55,90,'#E4F3EA'),('Spring Boot\nAPI',340,90,'#D7EDDF'),('MySQL',625,90,'#E4F3EA'),('FastAPI\nML service',910,90,'#C8E5D3'),('Versioned\nartifacts',1195,430,'#D7EDDF')]
    for text,x,y,c in boxes:
        d.rounded_rectangle((x,y,x+250,y+130),22,fill=c,outline='#155E43',width=5)
        lines=text.split('\n'); yy=y+48-(len(lines)-1)*15
        for line in lines:
            bb=d.textbbox((0,0),line,font=f);d.text((x+125-(bb[2]-bb[0])/2,yy),line,font=f,fill='#103D2E');yy+=35
    for x in [305,590,875]:
        d.line((x,155,x+68,155),fill='#155E43',width=6);d.polygon([(x+68,155),(x+46,143),(x+46,167)],fill='#155E43')
    d.line((1035,220,1295,425),fill='#155E43',width=6);d.polygon([(1295,425),(1268,411),(1282,394)],fill='#155E43')
    d.text((70,340),'Authenticated data flow: records are validated and persisted before model inference.',font=s,fill='#213C31')
    d.text((70,385),'The browser does not call the ML service directly. Artifact availability gates forecasts.',font=s,fill='#213C31')
    im.save(ASSETS/'architecture.png')

def draw_evaluation():
    im=PILImage.new('RGB',(1400,600),'white');d=ImageDraw.Draw(im); f=ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf',30); s=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',18)
    d.text((70,35),'Chronological evaluation reporting protocol',font=f,fill='#103D2E')
    x0,y0=170,450; d.line((x0,y0,1290,y0),fill='#5A6B62',width=3)
    parts=[('Training\nEarliest 70%',170, '#B9DCC8'),('Validation\nFollowing 15%',550,'#91C6A8'),('Test\nLatest 15%',930,'#5BA57B')]
    for label,x,c in parts:
        d.rounded_rectangle((x,y0-180,x+260,y0-50),15,fill=c,outline='#155E43',width=3)
        yy=y0-145
        for line in label.split('\n'):
            bb=d.textbbox((0,0),line,font=s);d.text((x+130-(bb[2]-bb[0])/2,yy),line,font=s,fill='#103D2E');yy+=32
    messages=[('Fit preprocessing and\nfeature selection',170),('Choose hyperparameters and\nfusion configuration',550),('Report held-out MAE, RMSE,\nR squared and sample count',930)]
    for message,x in messages:
        for idx,line in enumerate(message.split('\n')):
            d.text((x,y0+40+idx*24),line,font=s,fill='#213C31')
    im.save(ASSETS/'evaluation.png')

def styles():
    ss=getSampleStyleSheet()
    return {
      'title':ParagraphStyle('title',fontName='TimesB',fontSize=17,leading=20,alignment=TA_CENTER,spaceAfter=8),
      'author':ParagraphStyle('author',fontName='Times',fontSize=6.5,leading=7.6,alignment=TA_CENTER),
      'abs':ParagraphStyle('abs',fontName='Times',fontSize=8,leading=9.4,alignment=TA_JUSTIFY,spaceAfter=4),
      'h':ParagraphStyle('h',fontName='TimesB',fontSize=9,leading=11,alignment=TA_CENTER,spaceBefore=4,spaceAfter=3),
      'sub':ParagraphStyle('sub',fontName='TimesB',fontSize=8.2,leading=9.5,spaceBefore=3,spaceAfter=2),
      'body':ParagraphStyle('body',fontName='Times',fontSize=7.8,leading=9.2,alignment=TA_JUSTIFY,spaceAfter=3),
      'cap':ParagraphStyle('cap',fontName='Times',fontSize=7,leading=8,alignment=TA_CENTER,spaceBefore=1,spaceAfter=3),
      'ref':ParagraphStyle('ref',fontName='Times',fontSize=7.4,leading=8.5,alignment=TA_LEFT,spaceAfter=2),
      'tiny':ParagraphStyle('tiny',fontName='Times',fontSize=6.8,leading=7.8,alignment=TA_JUSTIFY,spaceAfter=2),
    }
S=styles()
def P(text,style='body'): return Paragraph(text,S[style])
def table(rows,widths,header=True,fs=6.7):
    t=Table([[Paragraph(str(x),ParagraphStyle('cell',fontName='TimesB' if i==0 and header else 'Times',fontSize=fs,leading=fs+1.1,alignment=TA_CENTER if i==0 else TA_LEFT)) for x in row] for i,row in enumerate(rows)],colWidths=widths,repeatRows=1 if header else 0,hAlign='CENTER')
    styles=[('GRID',(0,0),(-1,-1),.35,HexColor('#B8C5BD')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]
    if header: styles += [('BACKGROUND',(0,0),(-1,0),GREEN),('TEXTCOLOR',(0,0),(-1,0),colors.white),('BACKGROUND',(0,1),(-1,-1),colors.white)]
    t.setStyle(TableStyle(styles));return t
def page_number(canvas,doc):
    canvas.saveState();canvas.setFont('Times',7);canvas.setFillColor(HexColor('#444444'));canvas.drawCentredString(W/2,.32*inch,f'{doc.page}');canvas.restoreState()
def col_table(left,right):
    return Table([[left,right]],colWidths=[3.48*inch,3.48*inch],style=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)])
def two(items):
    half=(len(items)+1)//2
    return col_table(items[:half],items[half:])
def main():
    draw_architecture();draw_evaluation()
    doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=.52*inch,leftMargin=.52*inch,topMargin=.43*inch,bottomMargin=.44*inch)
    story=[]
    title='An Explainable Adaptive Temporal Learning Framework for Early Plant Growth Forecasting Using Integrated Soil Environmental and Historical Growth Data'
    story += [P(title,'title')]
    authors=[
      '<b>Ms. B. Rajani</b><br/>Project Guide | Assistant Professor<br/>Department of Artificial Intelligence and Machine Learning<br/>Mohan Babu University, Tirupati, Andhra Pradesh, India',
      '<b>Golla Kalpana Devi</b><br/>Department of Computer Science and Engineering (AIML)<br/>Mohan Babu University, Tirupati, Andhra Pradesh, India<br/>gollakalpanadevi@gmail.com',
      '<b>Tammineni Jagadeesh</b><br/>Department of Computer Science and Engineering (AIML)<br/>Mohan Babu University, Tirupati, Andhra Pradesh, India<br/>Jagadeesht805@gmail.com',
      '<b>Penumuru Partha</b><br/>Department of Computer Science and Engineering (AIML)<br/>Mohan Babu University, Tirupati, Andhra Pradesh, India',
      '<b>Pathipati Hitesh Naidu</b><br/>Department of Computer Science and Engineering (AIML)<br/>Mohan Babu University, Tirupati, Andhra Pradesh, India<br/>hiteshpathipati45@gmail.com',
      '<b>Devarala Vamsi Krishna</b><br/>Department of Computer Science and Engineering (AIML)<br/>Mohan Babu University, Tirupati, Andhra Pradesh, India']
    at=Table([[P(a,'author') for a in authors[:3]],[P(a,'author') for a in authors[3:]]],colWidths=[2.32*inch]*3,style=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2),('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),3)])
    story += [at,Spacer(1,5)]
    abstract='<b>Abstract—</b> Plant growth is shaped by soil conditions, environmental exposure, and previous development. This paper presents an explainable adaptive temporal learning framework for forecasting future plant height from integrated soil, daily environmental, and historical growth observations. The framework constructs leakage-safe lagged and rolling features; benchmarks persistence, linear regression, Random Forest, XGBoost, GRU, and LSTM; and uses validation-trained stacking to combine tabular and temporal signals. Adaptive feature selection is fitted on the training period only, while SHAP provides local and global explanations for a fitted model. The design is evaluated with chronological partitions using MAE, RMSE, and R squared. A React, Spring Boot, MySQL, and FastAPI implementation separates user authorization, data persistence, and machine-learning inference. The supplied dataset inventory contains environmental and aggregate greenhouse measurements but no repeated plant-height target. Therefore, this paper reports the proposed system and reproducible evaluation protocol without fabricating performance values.'
    story += [P(abstract,'abs'),P('<b>Index Terms—</b> Plant growth forecasting, temporal learning, explainable AI, SHAP, feature selection, precision agriculture.','abs')]
    story += [P('I. INTRODUCTION','h'), P('Plant growth monitoring supports evidence-based cultivation, yet manual measurement alone cannot reveal all temporal effects of weather, soil and prior development. Forecasting requires an explicit distinction between measured observations and future estimates. The proposed system forecasts future plant height in centimetres for a stated horizon, and retains the feature snapshot and model version that produced every forecast.','body'),P('Conventional tabular machine learning can represent nonlinear interactions, but often treats each row independently. Growth trajectories instead reflect accumulated environmental exposure and earlier growth. The proposed framework therefore combines soil properties, daily environmental observations, and a plant-specific historical growth sequence. It is designed as a research decision-support system; it does not diagnose disease, guarantee yield, or convert an attribution into a causal biological claim.','body')]
    story += [P('A. Contributions','sub'),P('1) A leakage-safe multimodal formulation for future-height forecasting; 2) comparable tabular and sequential model benchmarks; 3) adaptive feature selection and validation-trained fusion; 4) SHAP explanations linked to the fitted artifact and input snapshot; and 5) an end-to-end web architecture with authenticated data management and auditable prediction persistence.','body')]
    story += [P('II. RELATED WORK AND BASE PAPER CONTEXT','h'),P('Environmental sensing and recurrent modelling have shown that plant growth depends on prior conditions. LSTM-based tomato-height prediction and multimodal greenhouse trajectory modelling motivate sequence-aware forecasts. SHAP has also been used to inspect predictive feature contributions in agricultural applications. However, an accessible, auditable system combining soil data, daily environment, historical height, adaptive selection, model fusion, and time-aware evaluation remains a useful integration problem.','body')]
    story += [P('The selected base paper by Condò et al. presents a self-adhesive fiber Bragg grating wearable for physical monitoring of stem elongation. Its goal is measurement through an optical sensor adhered to the plant. In contrast, the present work predicts a later numerical height using prior records and contextual data. The approaches are complementary but are not equivalent: this application does not reproduce, replace, or claim the sensor’s metrological performance.','body'),PageBreak()]
    # page 2
    story += [P('III. BASE PAPER COMPARISON AND PROPOSED SYSTEM','h')]
    rows=[['Aspect','FBG wearable base paper','Proposed forecasting framework'],['Primary goal','Monitor stem elongation through an attached optical sensor.','Forecast a future plant-height value from prior records.'],['Core input','FBG wavelength/strain response and hydrogel wearable.','Soil, environmental and timestamped historical growth data.'],['Output','Physical measurement of elongation.','Predicted future height, model version and SHAP explanation.'],['Validation','Sensor metrology and in-vivo monitoring.','Chronological ML evaluation: MAE, RMSE, R squared.']]
    story += [table(rows,[1.05*inch,2.18*inch,3.73*inch]),P('Table I. Distinction between the base paper and the proposed project.','cap')]
    story += [P('A. Working Flow','sub'),Image(str(ASSETS/'framework.png'),width=6.7*inch,height=2.1*inch),P('Fig. 1. Proposed workflow from provenance-preserving records to explainable forecast.','cap')]
    story += [P('At a forecast origin, soil records are joined by plant or location and valid temporal meaning. Daily environmental data are joined by location and timestamp; historical growth is joined by stable plant identity. Lagged height, observed growth rate, rolling environmental summaries, cumulative precipitation, time gaps, and valid soil attributes are then generated. A feature is retained only if it was available at the origin timestamp.','body')]
    story += [P('B. Data Integrity and Target Definition','sub')]
    rows=[['Modality','Example fields','Control'],['Soil','pH, moisture, nitrogen, phosphorus, potassium, texture','Null is retained for unknown values; source, depth, and date are recorded.'],['Environment','temperature, humidity, precipitation, solar radiation','Source units are retained; radiation is never renamed as lux.'],['Growth','plant code, measurement timestamp, plant height','No synthetic daily heights; duplicate timestamps are rejected.']]
    story += [table(rows,[1.0*inch,2.15*inch,3.81*inch]),P('Table II. Data modalities and integrity controls.','cap')]
    story += [P('The primary target is future plant height: the height measured at the valid observation nearest to origin plus horizon. For irregular sampling, origins without a target within the declared alignment tolerance are excluded. A separate growth-amount target may be trained only as a separately labelled experiment.','body'),PageBreak()]
    # page3
    story += [P('IV. MODELS FEATURE SELECTION AND EXPLAINABILITY','h'),P('A persistence baseline predicts the latest measured height and establishes whether additional modelling has value. Linear regression is a second simple benchmark. Random Forest and XGBoost consume selected tabular features. GRU and LSTM consume chronological sequences grouped by plant so that no sequence crosses plant identities. All transforms, including imputation and scaling, are fitted only on the training period.','body')]
    rows=[['Model','Representation','Research role'],['Persistence','Latest height','Minimum baseline.'],['Linear regression','Tabular features','Linear benchmark.'],['Random Forest','Selected tabular features','Nonlinear tree benchmark.'],['XGBoost','Selected tabular features','Boosted nonlinear benchmark.'],['GRU / LSTM','Per-plant chronological sequence','Temporal benchmark.'],['Stacked fusion','Temporally valid base predictions','Integrates tabular and temporal branches.']]
    story += [table(rows,[1.2*inch,2.1*inch,3.66*inch]),P('Table III. Model family and role.','cap')]
    story += [P('A. Adaptive Feature Selection','sub'),P('The selector is fitted with training data only, using model-based or permutation importance and a defined top-k or threshold rule. Persisted metadata records the selected feature names, their order, preprocessing version, training data version, and model configuration. This makes inference repeatable and prevents test-period information from selecting features.','body')]
    story += [P('B. Fusion and SHAP Explanation','sub'),P('The fusion model uses a validation-trained stacking strategy. Base learners are fit on the training period. Temporally valid base predictions form inputs to a meta-regressor, whose configuration is selected on validation data and frozen before final testing. Tree-model SHAP uses a tree explainer. For a neural temporal model, a validated explainer and representative training background are required. For fusion, meta-model contributions must be reported as fusion-level explanations; base-model explanations must not be presented as an explanation of the final fused value.','body')]
    story += [P('C. Explanation Output','sub'),P('For every completed forecast, the system records the selected model and version, base output, positive and negative feature contributions, contribution magnitudes, warnings, and input snapshot. SHAP is an explanation of learned model behaviour, not proof that a feature biologically caused growth.','body')]
    story += [P('V. IMPLEMENTATION ARCHITECTURE','h'),Image(str(ASSETS/'architecture.png'),width=6.75*inch,height=2.95*inch),P('Fig. 2. Full-stack deployment architecture and separation of responsibilities.','cap')]
    story += [P('The React client retrieves data only from Spring Boot. Spring Security verifies JWTs and ownership before plants, observations, or predictions are read. The backend then gathers validated records, calls the FastAPI service, persists the returned model metadata and explanation, and returns a frontend-friendly response. A missing or incompatible artifact produces an explicit error rather than a fallback prediction.','body'),PageBreak()]
    # page4
    story += [P('VI. EVALUATION PROTOCOL AND RESULTS REPORTING','h'),P('Forecasting evaluation must be chronological rather than randomly shuffled. The earliest observations are reserved for training, the following observations for model selection, and the newest observations for the final held-out test. Model comparison is valid only when all compared models use the same target, horizon, and test observations.','body'),Image(str(ASSETS/'evaluation.png'),width=6.75*inch,height=2.9*inch),P('Fig. 3. Chronological evaluation protocol. No performance bars are shown until valid experimental results exist.','cap')]
    rows=[['Metric','Definition','Interpretation'],['MAE','mean absolute error','Average absolute future-height error in centimetres.'],['RMSE','square root of mean squared error','Penalizes larger height errors more strongly.'],['R squared','1 - residual sum of squares / total sum of squares','Explained variation; guarded for small or constant sets.']]
    story += [table(rows,[1.0*inch,2.38*inch,3.58*inch]),P('Table IV. Regression measures to be reported from held-out predictions.','cap')]
    story += [P('A. Current Dataset Observation','sub'),P('The supplied aggregate greenhouse dataset includes weather and fruit/biomass measures but marks plant_height_cm as not provided. It therefore cannot validly train, tune, or score a plant-height forecaster. This is a data availability observation, not an empirical finding about model quality. The implementation must receive repeated timestamped measurements per plant before a seven-day height experiment can be claimed.','body')]
    story += [P('B. Results Reporting Plan','sub'),P('When a compatible dataset becomes available, Table V will be filled from the pipeline output with model version, target type, horizon, test date range, sample count, MAE, RMSE, and R squared. The bar-chart form commonly used in conference papers will then be generated from those stored values. It is intentionally not prefilled here: fabricated metrics would invalidate the research contribution.','body')]
    rows=[['Model','Horizon','MAE cm','RMSE cm','R squared','Status'],['Persistence','7 days','Not evaluated','Not evaluated','Not evaluated','Awaiting height data'],['Random Forest','7 days','Not evaluated','Not evaluated','Not evaluated','Awaiting height data'],['XGBoost','7 days','Not evaluated','Not evaluated','Not evaluated','Awaiting height data'],['GRU / LSTM / Fusion','7 days','Not evaluated','Not evaluated','Not evaluated','Awaiting sequential height data']]
    story += [table(rows,[1.35*inch,.72*inch,1.0*inch,1.05*inch,1.0*inch,1.84*inch]),P('Table V. Honest evaluation status at the time of writing.','cap'),PageBreak()]
    # page5
    story += [P('VII. APPLICATION WORKFLOW AND OBSERVATION MANAGEMENT','h'),P('A user registers a plant and its growing location, then enters or imports soil records, environmental observations, and historical growth measurements. Each input retains a source, timestamp, quality status, and raw value. CSV import validation reports accepted rows, rejected rows, missing-value summary, duplicate-record summary, and row-level error information rather than silently discarding data.','body')]
    rows=[['Step','System activity','Audit artefact'],['1','Authenticate user and enforce ownership.','JWT identity and authorized resource scope.'],['2','Register plant and location.','Stable plant code and location reference.'],['3','Store validated observations.','Timestamp, source, quality status.'],['4','Request supported forecast.','Feature snapshot and artifact version.'],['5','Persist model result and SHAP explanation.','Prediction timestamp and explanation JSON.'],['6','Record future actual height.','Absolute error and evaluation history.']]
    story += [table(rows,[.55*inch,3.05*inch,3.36*inch]),P('Table VI. End-to-end operational flow.','cap')]
    story += [P('A. Data Quality Rules','sub'),P('The request is rejected for unknown plant identifiers, negative heights, invalid pH, humidity outside 0 to 100 percent, duplicate growth timestamps, unsupported horizons, insufficient historical sequence length, or unavailable artifacts. Missing values are never replaced with zero. Environmental gaps are represented as gaps and are not forward-filled unless a documented, training-derived policy justifies it.','body')]
    story += [P('B. Operational Outputs','sub'),P('The dashboard distinguishes measured records from forecasts, shows “Not available” for absent values, and labels every forecast as a prediction rather than a measurement. The results page reports the current height, forecast horizon, predicted future height or growth amount, increase relative to current height where appropriate, model version, data-quality warnings, and actual-versus-predicted error after the future measurement is recorded.','body')]
    story += [P('C. Responsible Interpretation','sub'),P('A plotted prediction is only a model estimate. It must not be described as improved crop yield, plant diagnosis, or a guaranteed outcome. The model comparison becomes a research result only after the chronological held-out experiment has completed successfully. The current system design makes this distinction visible in both the API and user interface.','body')]
    story += [P('VIII. CONCLUSION AND FUTURE WORK','h'),P('This work defines a full-stack, explainable temporal framework for forecasting future plant height from soil, environmental, and historical observations. Its central contribution is not merely a model list but a reproducible pathway from validated records to leakage-safe training, artifact-gated inference, auditable explanations, and chronological evaluation. The immediate research priority is collection or licensing of repeated timestamped plant-height measurements at a sampling frequency that supports the intended horizon. Future work will evaluate uncertainty, species transfer, location transfer, and the potential integration of sensor measurements as an additional input stream.','body'),PageBreak()]
    # page6
    story += [P('REFERENCES','h')]
    refs=[
      '[1] I. Condò, B. Pizziconi, S. Cimini, M. Trombetta, L. De Gara, E. Schena, S. M. Giannitelli, and D. Lo Presti, “An Innovative Self-Adhesive Wearable Sensor Based on Fiber Bragg Grating Technology for Plant Growth Monitoring,” IEEE Sensors Journal, vol. 25, no. 2, pp. 2705-2713, 2025.',
      '[2] L. Cha et al., “Artificial intelligence based prediction of tomato plant height using environmental determinants,” Computers and Electronics in Agriculture, 2022.',
      '[3] M. Riesselman et al., “Self-supervised learning of plant growth trajectories from multimodal industrial greenhouse data,” 2024.',
      '[4] S. M. Lundberg and S.-I. Lee, “A Unified Approach to Interpreting Model Predictions,” Advances in Neural Information Processing Systems, 2017.',
      '[5] L. Breiman, “Random Forests,” Machine Learning, vol. 45, pp. 5-32, 2001.',
      '[6] T. Chen and C. Guestrin, “XGBoost: A Scalable Tree Boosting System,” Proc. 22nd ACM SIGKDD, 2016.',
      '[7] K. Cho et al., “Learning Phrase Representations using RNN Encoder-Decoder for Statistical Machine Translation,” EMNLP, 2014.',
      '[8] S. Hochreiter and J. Schmidhuber, “Long Short-Term Memory,” Neural Computation, vol. 9, no. 8, pp. 1735-1780, 1997.',
      '[9] ISRIC World Soil Information, “SoilGrids,” https://soilgrids.org/, accessed 2026.',
      '[10] NASA POWER, “Daily API,” https://power.larc.nasa.gov/docs/services/api/temporal/daily/, accessed 2026.',
      '[11] A. Debbagh et al., “Sequence-informed plant-growth simulation with environmental context,” 2024.',
      '[12] T. Zhang et al., “Machine learning and crop growth models for agricultural prediction: a review,” 2021.'
    ]
    for r in refs:story.append(P(r,'ref'))
    story += [Spacer(1,7),P('APPENDIX: REPRODUCIBILITY CHECKLIST','h')]
    rows=[['Item','Requirement'],['Target','Future plant height in cm, with a declared horizon and alignment tolerance.'],['Split','Chronological train, validation, and final held-out test periods.'],['Transforms','Fit imputation, scaling, encoding, and feature selection on training only.'],['Artifacts','Store feature order, pipeline version, model version, configuration, and evaluation details.'],['Reporting','Give sample count, date range, MAE, RMSE, R squared, and data limitations.'],['Explainability','Link the explanation to the exact model and transformed input; do not imply causality.']]
    story += [table(rows,[1.25*inch,5.71*inch]),P('Table VII. Minimum reproducibility requirements for the final experiment.','cap')]
    story += [P('<b>Author information note:</b> E-mail addresses are shown only where supplied by the project team. This six-page draft uses a standard conference-paper layout and should be adjusted to the final conference’s official template before submission.','tiny')]
    doc.build(story,onFirstPage=page_number,onLaterPages=page_number)
if __name__=='__main__':main()
