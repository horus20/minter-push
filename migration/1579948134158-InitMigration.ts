import {MigrationInterface, QueryRunner} from "typeorm";

export class InitMigration1579948134158 implements MigrationInterface {
    name = 'InitMigration1579948134158'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `wallet` (`id` int NOT NULL AUTO_INCREMENT, `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `wallet` varchar(16) NOT NULL, `mxaddress` varchar(42) NULL, `status` int NOT NULL, `balances` text NULL, `params` text NULL, `companyId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `warehouse` (`id` int NOT NULL AUTO_INCREMENT, `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `mxaddress` varchar(42) NULL, `seed` text NOT NULL, `balances` text NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `company` (`id` int NOT NULL AUTO_INCREMENT, `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `params` text NULL, `email` varchar(512) NULL, `password` varchar(64) NULL, `status` int NOT NULL, `warehouseWalletId` int NULL, UNIQUE INDEX `REL_c42d950990042d772f87d396ed` (`warehouseWalletId`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `wallet` ADD CONSTRAINT `FK_4956f7d428afad68fdac9724211` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `company` ADD CONSTRAINT `FK_c42d950990042d772f87d396edb` FOREIGN KEY (`warehouseWalletId`) REFERENCES `warehouse`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `company` DROP FOREIGN KEY `FK_c42d950990042d772f87d396edb`", undefined);
        await queryRunner.query("ALTER TABLE `wallet` DROP FOREIGN KEY `FK_4956f7d428afad68fdac9724211`", undefined);
        await queryRunner.query("DROP INDEX `REL_c42d950990042d772f87d396ed` ON `company`", undefined);
        await queryRunner.query("DROP TABLE `company`", undefined);
        await queryRunner.query("DROP TABLE `warehouse`", undefined);
        await queryRunner.query("DROP TABLE `wallet`", undefined);
    }

}
