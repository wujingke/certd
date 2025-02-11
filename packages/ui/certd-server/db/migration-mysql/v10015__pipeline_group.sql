CREATE TABLE `pi_pipeline_group`
(
  `id`          bigint PRIMARY KEY AUTO_INCREMENT NOT NULL,
  `user_id`     bigint      NOT NULL,
  `name`        varchar(100) NOT NULL,
  `icon`        varchar(100),
  `favorite`    boolean      NOT NULL DEFAULT false,
  `create_time` timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pi_pipeline
  ADD COLUMN group_id bigint;
