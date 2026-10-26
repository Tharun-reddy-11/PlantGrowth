package com.plantgrowth.forecasting.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "soil_records")
public class SoilRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "location_id") private GrowingLocation location;
    @ManyToOne @JoinColumn(name = "plant_id") private Plant plant;
    @Column(name = "observation_date") private LocalDate observationDate;
    @Column(name = "soil_ph") private Double soilPh;
    @Column(name = "soil_moisture") private Double soilMoisture;
    private Double nitrogen;
    private Double phosphorus;
    private Double potassium;
    private String source;
    @Column(name = "quality_status") private String qualityStatus = "VALID";
    public Long getId(){return id;} public LocalDate getObservationDate(){return observationDate;} public Double getSoilPh(){return soilPh;} public Double getSoilMoisture(){return soilMoisture;} public Double getNitrogen(){return nitrogen;} public Double getPhosphorus(){return phosphorus;} public Double getPotassium(){return potassium;} public String getSource(){return source;}
    public void setLocation(GrowingLocation x){location=x;} public void setPlant(Plant x){plant=x;} public void setObservationDate(LocalDate x){observationDate=x;} public void setSoilPh(Double x){soilPh=x;} public void setSoilMoisture(Double x){soilMoisture=x;} public void setNitrogen(Double x){nitrogen=x;} public void setPhosphorus(Double x){phosphorus=x;} public void setPotassium(Double x){potassium=x;} public void setSource(String x){source=x;}
}
