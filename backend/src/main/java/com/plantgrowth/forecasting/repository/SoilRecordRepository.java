package com.plantgrowth.forecasting.repository;
import com.plantgrowth.forecasting.entity.SoilRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SoilRecordRepository extends JpaRepository<SoilRecord,Long>{ List<SoilRecord> findByPlantIdOrderByObservationDateDesc(Long plantId); }
