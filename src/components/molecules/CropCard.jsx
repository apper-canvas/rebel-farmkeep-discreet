import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const CropCard = ({ crop, onEdit, onDelete, showFarm = false }) => {
  const statusColors = {
    planted: 'bg-blue-100 text-blue-800 border-blue-200',
    growing: 'bg-green-100 text-green-800 border-green-200',
    mature: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ready: 'bg-orange-100 text-orange-800 border-orange-200',
    harvested: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    planted: 'Seed',
    growing: 'Sprout',
    mature: 'TreePine',
    ready: 'Star',
    harvested: 'Package'
  };

const plantingDate = new Date(crop.planting_date);
  const harvestDate = new Date(crop.expected_harvest_date);
  const daysUntilHarvest = differenceInDays(harvestDate, new Date());
  const daysGrowing = differenceInDays(new Date(), plantingDate);

  const progressPercentage = Math.max(0, Math.min(100, 
    (daysGrowing / differenceInDays(harvestDate, plantingDate)) * 100
  ));

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{crop.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{crop.variety}</p>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[crop.status]}`}>
            <ApperIcon name={statusIcons[crop.status]} size={12} />
            {crop.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="small"
            icon="Edit2"
            onClick={() => onEdit(crop)}
          />
          <Button
            variant="ghost"
            size="small"
            icon="Trash2"
            onClick={() => onDelete(crop.Id)}
            className="text-red-600 hover:text-red-700"
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Field Location */}
<div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="MapPin" size={14} />
          <span>{crop.field_location}</span>
        </div>

        {showFarm && crop.farmName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ApperIcon name="Map" size={14} />
            <span>{crop.farmName}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Growth Progress</span>
            <span className="font-medium text-gray-900">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-surface-200 rounded-full h-2">
            <motion.div
              className="bg-secondary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">Planted</p>
            <p className="text-gray-900">{format(plantingDate, 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Expected Harvest</p>
            <p className="text-gray-900">{format(harvestDate, 'MMM d, yyyy')}</p>
          </div>
        </div>

        {/* Days Until Harvest */}
        <div className="pt-2 border-t border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Days until harvest</span>
            <span className={`font-semibold ${
              daysUntilHarvest < 0 ? 'text-red-600' : 
              daysUntilHarvest <= 7 ? 'text-orange-600' : 
              'text-green-600'
            }`}>
              {daysUntilHarvest < 0 ? 'Overdue' : `${daysUntilHarvest} days`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CropCard;