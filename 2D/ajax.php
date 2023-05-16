<?php
    if(!isset($_GET['gpd'])) {
        die(json_encode(array('success'=>false)));
    } else {
        include('projects.php');

        function getProject($pName) {
            global $allProjects;
            for($p=0; $p<count($allProjects); $p++) {
                $pn = $allProjects[$p]->name;
                if($pn == $pName) return $allProjects[$p];
            }
            return false;
        }

        $project = strval($_GET['gpd']);
        $details = getProject($project);
        if($details !== false) {
            $result = array('success'=>true, 'data'=>$details);
        } else {
            $result = array('success'=>false);
        }
        echo json_encode($result);
    }
?>