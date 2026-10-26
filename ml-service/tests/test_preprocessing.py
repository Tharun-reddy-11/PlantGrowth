import pandas as pd
import pytest
from app.preprocessing.pipeline import require_height_training_frame
def test_blank_height_is_not_accepted():
    with pytest.raises(ValueError, match='No plant-height'):
        require_height_training_frame(pd.DataFrame({'plant_code':['p1'],'measurement_timestamp':['2024-01-01'],'plant_height_cm':[None]}))
